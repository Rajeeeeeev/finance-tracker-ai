import datetime
from decimal import Decimal
from django.db.models import Sum
from .models import CreditCard
from expenses.models import Expense


def get_billing_cycle_dates(card):
    today = datetime.date.today()
    if today.day >= card.billing_date:
        cycle_start = today.replace(day=card.billing_date)
    else:
        first       = today.replace(day=1)
        prev_month  = first - datetime.timedelta(days=1)
        cycle_start = prev_month.replace(day=card.billing_date)
    due_date = cycle_start + datetime.timedelta(days=card.due_date_days)
    return cycle_start, due_date


def get_card_summary(card):
    cycle_start, due_date = get_billing_cycle_dates(card)

    expenses = Expense.objects.filter(
        credit_card=card,
        date__gte=cycle_start
    )

    current_balance = expenses.aggregate(
        total=Sum('amount')
    )['total'] or Decimal('0.00')

    available_credit    = card.credit_limit - current_balance
    utilization_percent = round(
        float(current_balance / card.credit_limit * 100), 2
    ) if card.credit_limit else 0
    minimum_due = round(float(current_balance) * 0.05, 2)

    return {
        'card_id':             card.id,
        'card_name':           card.card_name,
        'bank_name':           card.bank_name,
        'card_network':        card.card_network,
        'last_four_digits':    card.last_four_digits,
        'credit_limit':        float(card.credit_limit),
        'current_balance':     float(current_balance),
        'available_credit':    float(available_credit),
        'utilization_percent': utilization_percent,
        'minimum_due':         minimum_due,
        'total_due':           float(current_balance),
        'due_date':            due_date.strftime('%Y-%m-%d'),
        'billing_date':        card.billing_date,
        'cycle_start':         cycle_start.strftime('%Y-%m-%d'),
        'expense_count':       expenses.count(),
    }


def auto_create_bill_reminder(card, user):
    """Auto-creates a bill reminder when a card is added."""
    from bill_reminders.models import BillReminder

    _, due_date = get_billing_cycle_dates(card)

    # Don't duplicate
    if BillReminder.objects.filter(
        user=user,
        related_credit_card=card,
        due_date=due_date
    ).exists():
        return

    BillReminder.objects.create(
        user=user,
        title=f"{card.card_name} ****{card.last_four_digits} Bill",
        amount=0,           # will be ₹0 at creation, updated when expenses come in
        due_date=due_date,
        is_paid=False,
        related_credit_card=card,
        notes=f"Auto-generated credit card bill reminder."
    )