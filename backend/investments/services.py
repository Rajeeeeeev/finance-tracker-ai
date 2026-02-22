from datetime import timedelta
from decimal import Decimal

from django.utils import timezone
from django.db.models import Q, Sum

from .models import Investment


# Thresholds (in days) after which an investment is considered stale
# and the user should be reminded to update the current value
UPDATE_THRESHOLDS = {
    "EQUITY": 7,
    "COMMODITY": 30,
    "BOND": 90,
    "DEPOSIT": 180,
    "OTHER": 30,
}


def get_user_investments(user_id):
    """
    Return all active investments for the given user,
    ordered by most recently created.
    """
    if not user_id:
        return Investment.objects.none()

    return Investment.objects.filter(
        user_id=user_id,
        is_active=True
    ).order_by("-created_at")


def get_investment_by_id(investment_id, user_id):
    """
    Return a single active investment by ID, scoped to the given user.
    Returns None if not found or if the investment belongs to another user.
    """
    if not user_id:
        return None

    try:
        return Investment.objects.get(
            id=investment_id,
            user_id=user_id,
            is_active=True
        )
    except Investment.DoesNotExist:
        return None


def get_investment_summary(user_id):
    """
    Return an aggregated financial summary of all active investments
    for the given user — total invested, current value, profit/loss,
    overall profit percentage, and investment count.
    All aggregation is done at the database level for efficiency.
    """
    if not user_id:
        return {
            "total_invested": Decimal("0"),
            "total_current_value": Decimal("0"),
            "total_profit_loss": Decimal("0"),
            "overall_profit_percentage": Decimal("0"),
            "total_investments": 0,
        }

    investments = Investment.objects.filter(
        user_id=user_id,
        is_active=True
    )

    totals = investments.aggregate(
        total_invested=Sum("invested_amount"),
        total_current_value=Sum("current_amount"),
        total_profit_loss=Sum("profit_loss"),
    )

    total_invested = totals["total_invested"] or Decimal("0")
    total_current_value = totals["total_current_value"] or Decimal("0")
    total_profit_loss = totals["total_profit_loss"] or Decimal("0")

    overall_profit_percentage = Decimal("0")

    if total_invested > Decimal("0"):
        overall_profit_percentage = round(
            (total_profit_loss / total_invested) * Decimal("100"), 2
        )

    return {
        "total_invested": total_invested,
        "total_current_value": total_current_value,
        "total_profit_loss": total_profit_loss,
        "overall_profit_percentage": overall_profit_percentage,
        "total_investments": investments.count(),
    }


def get_stale_investment_updates(user_id):
    """
    Return a list of investments whose current value hasn't been updated
    within the allowed threshold for their investment type.

    Instead of loading all investments into Python and filtering in a loop,
    we build a combined Q filter and let the database do the work in a
    single query — much more efficient for large datasets.
    """
    if not user_id:
        return []

    now = timezone.now()

    # Build a combined OR filter: one condition per investment type
    stale_filter = Q()

    for investment_type, days in UPDATE_THRESHOLDS.items():
        threshold_date = now - timedelta(days=days)
        stale_filter |= Q(
            investment_type=investment_type,
            current_amount_updated_at__lt=threshold_date
        )

    # Single DB query — filtering is done entirely at the database level
    stale_investments = Investment.objects.filter(
        user_id=user_id,
        is_active=True
    ).filter(stale_filter)

    reminders = []

    for investment in stale_investments:

        threshold_days = UPDATE_THRESHOLDS.get(investment.investment_type, 30)

        days_since_update = (now - investment.current_amount_updated_at).days

        reminders.append({
            "investment_id": investment.id,
            "name": investment.name,
            "type": investment.investment_type,
            "last_updated": investment.current_amount_updated_at,
            "days_since_update": days_since_update,
            "threshold_days": threshold_days,
            "message": f"Current value not updated in {days_since_update} days. Please update.",
        })

    return reminders