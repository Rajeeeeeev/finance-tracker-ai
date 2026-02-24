from decimal import Decimal
from datetime import date
import calendar
from django.db.models import Sum, Q
from django.utils import timezone

from expenses.models import Expense
from income.models import Income
from savings.models import SavingsEntry
from liabilities.models import LiabilityPayment, Liability
from recurring_expenses.models import RecurringExpense
from investments.models import Investment
from bill_reminders.models import BillReminder


def get_date_filter(start_date=None, end_date=None, year=None, month=None):

    today = timezone.now().date()

    # OPTION 1: Custom date range
    if start_date and end_date:

        # Convert only if string
        if isinstance(start_date, str):
            start = date.fromisoformat(start_date)
        else:
            start = start_date

        if isinstance(end_date, str):
            end = date.fromisoformat(end_date)
        else:
            end = end_date

        # Prevent future dates
        if end > today:
            end = today

        return start, end

    # OPTION 2: Specific month
    if year and month:

        year = int(year)
        month = int(month)

        start = date(year, month, 1)

        last_day = calendar.monthrange(year, month)[1]
        end = date(year, month, last_day)

        if year == today.year and month == today.month:
            end = today

        return start, end

    # OPTION 3: Default current month
    start = today.replace(day=1)
    end = today

    return start, end

def get_financial_summary(user_id, start_date=None, end_date=None):
    start, end = get_date_filter(start_date=start_date, end_date=end_date)

    def date_range(field):
        if start and end:
            return Q(**{f"{field}__gte": start, f"{field}__lte": end})
        return Q()

    total_income = Income.objects.filter(
        date_range("date"), user_id=user_id
    ).aggregate(total=Sum("amount"))["total"] or Decimal("0")

    total_expenses = Expense.objects.filter(
        date_range("date"), user=user_id, source="MANUAL"
    ).aggregate(total=Sum("amount"))["total"] or Decimal("0")

    recurring_qs = RecurringExpense.objects.filter(user_id=user_id, is_active=True)
    if start and end:
        recurring_qs = recurring_qs.filter(start_date__lte=end)
    total_recurring = recurring_qs.aggregate(
        total=Sum("amount")
    )["total"] or Decimal("0")

    total_savings = SavingsEntry.objects.filter(
        date_range("date"), user_id=user_id, is_active=True
    ).aggregate(total=Sum("amount"))["total"] or Decimal("0")

    total_liability_payments = LiabilityPayment.objects.filter(
        date_range("payment_date"), user_id=user_id
    ).aggregate(total=Sum("amount"))["total"] or Decimal("0")

    investment_data = Investment.objects.filter(
    user_id=user_id,
    is_active=True
).aggregate(
    invested=Sum("invested_amount"),
    current=Sum("current_amount")
)

    total_invested = investment_data["invested"] or Decimal("0")
    total_investment_current = investment_data["current"] or Decimal("0")
    total_invested = Investment.objects.filter(
        user_id=user_id, is_active=True
    ).aggregate(total=Sum("invested_amount"))["total"] or Decimal("0")

    bills_qs = BillReminder.objects.filter(user_id=user_id)
    if start and end:
        bills_qs = bills_qs.filter(due_date__lte=end)

    paid = bills_qs.filter(is_paid=True)
    pending = bills_qs.filter(is_paid=False)

    net_balance = (
    total_income
    - total_expenses
    - total_recurring
    - total_liability_payments
)

    # Net worth
    total_remaining_principal = Liability.objects.filter(
        user_id=user_id,
        is_active=True
    ).aggregate(total=Sum("remaining_principal"))["total"] or Decimal("0")

    net_worth = (
    net_balance
    + total_savings
    + total_investment_current
    - total_remaining_principal
)

    # Net balance message
    if net_balance < Decimal("0"):
        message = "⚠️ Your net balance is negative. Please review your spending or consider adding more income."
    elif net_balance == Decimal("0"):
        message = "Your net balance is zero. Try to save more this month."
    else:
        message = "✅ You are in a good financial position this month."

    return {
        "period": f"{start} to {end}" if start and end else "Custom Period",
        "message": message,
        "total_income": total_income,
        "total_expenses": total_expenses,
        "total_recurring_expenses": total_recurring,
        "total_savings": total_savings,
        "total_liability_payments": total_liability_payments,
        "total_invested": total_invested,
        "total_investment_current_value": total_investment_current,
        "bills": {
            "paid_count": paid.count(),
            "paid_amount": paid.aggregate(total=Sum("amount"))["total"] or Decimal("0"),
            "pending_count": pending.count(),
            "pending_amount": pending.aggregate(total=Sum("amount"))["total"] or Decimal("0"),
        },
        "net_balance": net_balance,
        "total_remaining_principal": total_remaining_principal,
        "net_worth": net_worth,
    }