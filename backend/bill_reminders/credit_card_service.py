from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from credit_cards.models import CreditCard
from expenses.models import Expense


def calculate_due_date_from_card(card):
    """
    Calculate the actual due date from credit card billing info.
    Example: billing_date=25, due_date_days=15
      → billing on March 25, due on April 10
    """
    today = date.today()

    if today.day <= card.billing_date:
        # Billing date hasn't occurred yet this month
        billing_date = date(today.year, today.month, card.billing_date)
    else:
        # Billing date has passed, use next month
        next_month = today + relativedelta(months=1)
        try:
            billing_date = date(next_month.year, next_month.month, card.billing_date)
        except ValueError:
            # e.g. billing_date=31 in February — clamp to last day
            billing_date = (
                date(next_month.year, next_month.month, 1) + relativedelta(months=1)
            ) - timedelta(days=1)

    return billing_date + timedelta(days=card.due_date_days)


def get_credit_card_statement_amount(card, month=None):
    """Total amount spent on a credit card in a given calendar month."""
    if month is None:
        month = date.today()

    start_date = date(month.year, month.month, 1)
    end_date = (start_date + relativedelta(months=1)) - timedelta(days=1)

    expenses = Expense.objects.filter(
        user=card.user,
        credit_card=card,
        created_at__date__gte=start_date,
        created_at__date__lte=end_date,
    )
    return sum(exp.amount for exp in expenses) if expenses.exists() else 0


def create_credit_card_bill_reminder(card, for_month=None):
    """
    Create a bill reminder for a credit card's current cycle.
    Only creates if:
      - card is active
      - card has spending this month
      - no unpaid reminder already exists for this due date
    """
    # Import here to avoid circular imports
    from bill_reminders.models import BillReminder

    if not card.is_active:
        return None

    if for_month is None:
        for_month = date.today()

    amount = get_credit_card_statement_amount(card, for_month)
    if amount == 0:
        return None  # No spending — don't create a reminder

    due_date = calculate_due_date_from_card(card)

    # Idempotent: return existing unpaid reminder if one already exists
    existing = BillReminder.objects.filter(
        user=card.user,
        related_credit_card=card,
        due_date=due_date,
        is_paid=False,
    ).first()

    if existing:
        return existing

    return BillReminder.objects.create(
        user=card.user,
        bill_name=f"{card.card_name} ****{card.last_four_digits} - Statement",
        category="Subscriptions",
        amount=amount,
        due_date=due_date,
        is_recurring=True,
        frequency="MONTHLY",
        recurring_until_date=None,
        notes=(
            f"Credit card bill for {card.bank_name} {card.card_name}. "
            f"Billing date: {card.billing_date}"
        ),
        related_credit_card=card,
    )


def get_credit_card_outstanding(card):
    """Total unpaid bill reminder amount for this card."""
    from bill_reminders.models import BillReminder

    unpaid = BillReminder.objects.filter(
        related_credit_card=card,
        is_paid=False,
    )
    return sum(r.amount for r in unpaid)


def get_credit_card_utilization(card):
    """Current credit utilization percentage (capped at 100%)."""
    outstanding = get_credit_card_outstanding(card)
    utilization = (float(outstanding) / float(card.credit_limit)) * 100
    return min(round(utilization, 2), 100.0)


def get_card_summary(card):
    """
    Full summary dict for a card — used by both list and detail views.

    Now includes `unpaid_reminder_id` so the frontend can call
    mark-paid directly from the credit cards page without having to
    navigate to the bill reminders page.
    """
    from bill_reminders.models import BillReminder

    outstanding = get_credit_card_outstanding(card)
    utilization = get_credit_card_utilization(card)
    available   = float(card.credit_limit) - float(outstanding)
    minimum_due = round(float(outstanding) * 0.05, 2)  # 5% of outstanding
    due_date    = calculate_due_date_from_card(card)

    # Fetch the most recent unpaid reminder for this card so the frontend
    # can show a "Pay Bill" button and knows which reminder ID to pass.
    unpaid_reminder = BillReminder.objects.filter(
        related_credit_card=card,
        is_paid=False,
    ).order_by("due_date").first()

    return {
        "id":                   card.id,
        "card_name":            card.card_name,
        "bank_name":            card.bank_name,
        "card_network":         card.card_network,
        "last_four_digits":     card.last_four_digits,
        "credit_limit":         float(card.credit_limit),
        "billing_date":         card.billing_date,
        "due_date_days":        card.due_date_days,
        "interest_rate":        float(card.interest_rate),
        "is_active":            card.is_active,
        # Computed fields
        "current_balance":      float(outstanding),
        "available_credit":     round(available, 2),
        "utilization_percent":  utilization,
        "minimum_due":          minimum_due,
        "next_due_date":        due_date.strftime("%d %b %Y"),
        # NEW: lets the frontend show a Pay Bill button per card
        "unpaid_reminder_id":   unpaid_reminder.id if unpaid_reminder else None,
        "unpaid_bill_amount":   float(unpaid_reminder.amount) if unpaid_reminder else 0,
    }


def auto_create_bill_reminder(card, user):
    """
    Called explicitly from CreditCardListCreateView.post() when a new
    card is added. At creation time there is no spending yet, so this
    is a no-op — but it's kept here as a hook for future logic.
    """
    # Don't create a reminder on card creation — there's no balance yet.
    # The signal on Expense post_save handles creation once spending happens.
    pass