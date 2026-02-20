from datetime import timedelta
from django.utils import timezone
from .models import Investment


UPDATE_THRESHOLDS = {

    "EQUITY": 7,
    "COMMODITY": 30,
    "BOND": 90,
    "DEPOSIT": 180,
    "OTHER": 30
}


def get_stale_investment_updates(user_id):

    now = timezone.now()

    reminders = []

    investments = Investment.objects.filter(
        user_id=user_id,
        is_active=True
    )

    for investment in investments:

        threshold_days = UPDATE_THRESHOLDS.get(
            investment.investment_type, 30
        )

        threshold_date = now - timedelta(days=threshold_days)

        if investment.current_amount_updated_at < threshold_date:

            days_since_update = (
                now - investment.current_amount_updated_at
            ).days

            reminders.append({

                "investment_id": investment.id,

                "name": investment.name,

                "type": investment.investment_type,

                "last_updated": investment.current_amount_updated_at,

                "days_since_update": days_since_update,

                "threshold_days": threshold_days,

                "message": "Update current value"

            })

    return reminders

from django.db.models import Sum
from decimal import Decimal
from .models import Investment


def get_user_investments(user_id):

    return Investment.objects.filter(
        user_id=user_id,
        is_active=True
    ).order_by("-created_at")


def get_investment_by_id(investment_id):

    try:
        return Investment.objects.get(id=investment_id)
    except Investment.DoesNotExist:
        return None


def get_investment_summary(user_id):

    investments = Investment.objects.filter(
        user_id=user_id,
        is_active=True
    )

    total_invested = investments.aggregate(
        total=Sum("invested_amount")
    )["total"] or Decimal("0")

    total_current_value = investments.aggregate(
        total=Sum("current_amount")
    )["total"] or Decimal("0")

    total_profit_loss = investments.aggregate(
        total=Sum("profit_loss")
    )["total"] or Decimal("0")

    overall_profit_percentage = Decimal("0")

    if total_invested > Decimal("0"):
        overall_profit_percentage = (
            total_profit_loss / total_invested
        ) * Decimal("100")

    return {

        "total_invested": total_invested,

        "total_current_value": total_current_value,

        "total_profit_loss": total_profit_loss,

        "overall_profit_percentage": round(
            overall_profit_percentage, 2
        ),

        "total_investments": investments.count()

    }
