import datetime
import calendar
from decimal import Decimal
from django.db.models import Sum

from bill_reminders.models import BillReminder
from .models import CreditCard
from expenses.models import Expense


def _safe_replace_day(date, day):
    """Clamp day to the last valid day of the month."""
    max_day = calendar.monthrange(date.year, date.month)[1]
    return date.replace(day=min(day, max_day))


def get_billing_cycle_dates(card):
    today = datetime.date.today()

    if today.day >= card.billing_date:
        cycle_start = _safe_replace_day(today, card.billing_date)
    else:
        first      = today.replace(day=1)
        prev_month = first - datetime.timedelta(days=1)
        cycle_start = _safe_replace_day(prev_month, card.billing_date)

    due_date = cycle_start + datetime.timedelta(days=card.due_date_days)
    return cycle_start, due_date


def get_card_current_balance(card):
    """
    The card's current outstanding balance = sum of all UNPAID bill reminders
    for this card.

    WHY this approach:
    - When user swipes card  → Expense(source=CREDIT_CARD) is created (for history)
    - When bill is generated → BillReminder is created with the cycle total
    - When user pays bill    → BillReminder.is_paid=True + Expense(source=BILL) created
    - So: unpaid reminders   = what the user still owes on the card
    - Once paid              = balance drops to 0 immediately after fetchCards()

    We do NOT sum raw Expense rows for balance because those CREDIT_CARD
    source rows persist after payment (they are the spending history).
    """
    unpaid = BillReminder.objects.filter(
        related_credit_card=card,
        is_paid=False,
    ).aggregate(total=Sum('amount'))['total']

    return Decimal(str(unpaid)) if unpaid else Decimal('0.00')


def get_card_summary(card):
    cycle_start, due_date = get_billing_cycle_dates(card)
    cycle_start_dt = datetime.datetime.combine(cycle_start, datetime.time.min)

    # Balance = unpaid bill reminders (resets to 0 as soon as bill is paid)
    current_balance = get_card_current_balance(card)

    available_credit    = card.credit_limit - current_balance
    utilization_percent = round(float(current_balance / card.credit_limit * 100), 2) if card.credit_limit else 0
    minimum_due         = round(float(current_balance) * 0.05, 2)

    # Spending history for this cycle (all CC purchases regardless of paid status)
    cycle_expenses = Expense.objects.filter(
        credit_card=card,
        source="CREDIT_CARD",
        created_at__gte=cycle_start_dt,
    )
    cycle_spend = cycle_expenses.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

    # Unpaid reminder id — lets the frontend show a Pay Bill button per card
    unpaid_reminder = BillReminder.objects.filter(
        related_credit_card=card,
        is_paid=False,
    ).order_by('due_date').first()

    return {
        'card_id':            card.id,
        'id':                 card.id,          # frontend uses card.id
        'card_name':          card.card_name,
        'bank_name':          card.bank_name,
        'card_network':       card.card_network,
        'last_four_digits':   card.last_four_digits,
        'credit_limit':       float(card.credit_limit),
        # Balance = what user OWES (unpaid bills), not raw CC spend
        'current_balance':    float(current_balance),
        'available_credit':   float(available_credit),
        'utilization_percent': utilization_percent,
        'minimum_due':        minimum_due,
        'total_due':          float(current_balance),
        'due_date':           due_date.strftime('%Y-%m-%d'),
        'next_due_date':      due_date.strftime('%d %b %Y'),
        'billing_date':       card.billing_date,
        'cycle_start':        cycle_start.strftime('%Y-%m-%d'),
        'cycle_spend':        float(cycle_spend),   # total swiped this cycle
        'expense_count':      cycle_expenses.count(),
        # Pay Bill button support
        'unpaid_reminder_id':  unpaid_reminder.id if unpaid_reminder else None,
        'unpaid_bill_amount':  float(unpaid_reminder.amount) if unpaid_reminder else 0,
    }


def auto_create_bill_reminder(card, user):
    """
    Called when a new card is added. No-op at creation time because
    there is no spending yet. The post_save signal on Expense handles
    reminder creation once the user makes their first purchase.
    """
    pass