import datetime
import calendar
from decimal import Decimal
from django.db.models import Sum
from .models import CreditCard
from expenses.models import Expense


def _safe_replace_day(date, day):
    """Replace the day in a date, clamping to the last valid day of that month."""
    max_day = calendar.monthrange(date.year, date.month)[1]
    return date.replace(day=min(day, max_day))


def get_billing_cycle_dates(card):
    today = datetime.date.today()
    if today.day >= card.billing_date:
        cycle_start = _safe_replace_day(today, card.billing_date)
    else:
        first       = today.replace(day=1)
        prev_month  = first - datetime.timedelta(days=1)
        cycle_start = _safe_replace_day(prev_month, card.billing_date)
    due_date = cycle_start + datetime.timedelta(days=card.due_date_days)
    return cycle_start, due_date


def get_card_summary(card):
    cycle_start, due_date = get_billing_cycle_dates(card)
    
    # ✅ FIX: Convert date to datetime and use created_at instead of date
    cycle_start_dt = datetime.datetime.combine(cycle_start, datetime.time.min)

    expenses = Expense.objects.filter(
        credit_card=card,
        created_at__gte=cycle_start_dt
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

    cycle_start, due_date = get_billing_cycle_dates(card)
    
    # ✅ FIX: Calculate ACTUAL current balance instead of hardcoding 0
    cycle_start_dt = datetime.datetime.combine(cycle_start, datetime.time.min)
    
    current_balance = Expense.objects.filter(
        credit_card=card,
        created_at__gte=cycle_start_dt
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

    # Don't duplicate reminders for the same due date
    if BillReminder.objects.filter(
        user=user,
        related_credit_card=card,
        due_date=due_date
    ).exists():
        return

    BillReminder.objects.create(
        user=user,
        title=f"{card.card_name} ****{card.last_four_digits} Bill",
        amount=float(current_balance),  # ✅ Use actual calculated balance
        due_date=due_date,
        is_paid=False,
        related_credit_card=card,
        notes=f"Auto-generated credit card bill reminder.",
        is_recurring=True  # ✅ Mark as recurring so next month's reminder is created
    )