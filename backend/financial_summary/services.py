from decimal import Decimal
from django.db.models import Sum, Q
from django.utils import timezone

from expenses.models import Expense
from income.models import Income
from savings.models import SavingsEntry
from liabilities.models import LiabilityPayment, Liability
from recurring_expenses.models import RecurringExpense
from investments.models import Investment
from bill_reminders.models import BillReminder


def get_date_filter(period):
    if period == "all":
        return None, None
    today = timezone.now().date()
    start = today.replace(day=1)
    return start, today


def get_financial_summary(user_id, period="monthly"):

    start, end = get_date_filter(period)

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
        - total_savings
    )

    # Net worth
    total_remaining_principal = Liability.objects.filter(
        user_id=user_id,
        is_active=True
    ).aggregate(total=Sum("remaining_principal"))["total"] or Decimal("0")

    net_worth = total_invested + total_savings - total_remaining_principal

    # Net balance message
    if net_balance < Decimal("0"):
        message = "⚠️ Your net balance is negative. Please review your spending or consider adding more income."
    elif net_balance == Decimal("0"):
        message = "Your net balance is zero. Try to save more this month."
    else:
        message = "✅ You are in a good financial position this month."

    return {
        "period": period,
        "message": message,
        "total_income": total_income,
        "total_expenses": total_expenses,
        "total_recurring_expenses": total_recurring,
        "total_savings": total_savings,
        "total_liability_payments": total_liability_payments,
        "total_investments": total_invested,
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