from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone
from dateutil.relativedelta import relativedelta

from expenses.models import Expense
from income.models import Income


# Single constant — change here and it applies to all three views.
# CREDIT_CARD purchases are excluded from totals because the real
# expense is recorded when the user pays their credit card bill (source=BILL).
CC_EXCLUDE = {"source": "CREDIT_CARD"}


class MonthlyTrendView(APIView):
    """
    Monthly spending + income + savings trend for the last 12 months.
    GET /api/analytics/monthly-trend/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        twelve_months_ago = today.replace(day=1) - relativedelta(months=11)

        expenses = (
            Expense.objects
            .filter(user=request.user, date__gte=twelve_months_ago)
            .exclude(**CC_EXCLUDE)          # ← CC purchases excluded
            .annotate(month=TruncMonth("date"))
            .values("month")
            .annotate(total=Sum("amount"))
            .order_by("month")
        )

        income = (
            Income.objects
            .filter(user=request.user, date__gte=twelve_months_ago)
            .annotate(month=TruncMonth("date"))
            .values("month")
            .annotate(total=Sum("amount"))
            .order_by("month")
        )

        expense_map = {e["month"].strftime("%Y-%m"): float(e["total"]) for e in expenses}
        income_map  = {i["month"].strftime("%Y-%m"): float(i["total"]) for i in income}

        result = []
        for i in range(12):
            month_date = today.replace(day=1) - relativedelta(months=(11 - i))
            key   = month_date.strftime("%Y-%m")
            label = month_date.strftime("%b %Y")
            exp   = expense_map.get(key, 0)
            inc   = income_map.get(key, 0)
            result.append({
                "month":    key,
                "label":    label,
                "expenses": exp,
                "income":   inc,
                "savings":  round(inc - exp, 2),
            })

        return Response(result)


class CategoryBreakdownView(APIView):
    """
    Expense breakdown by category for a given month (default: current month).
    GET /api/analytics/category-breakdown/?year=2025&month=4
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        year  = int(request.query_params.get("year",  today.year))
        month = int(request.query_params.get("month", today.month))

        breakdown = (
            Expense.objects
            .filter(user=request.user, date__year=year, date__month=month)
            .exclude(**CC_EXCLUDE)          # ← CC purchases excluded
            .values("category")
            .annotate(total=Sum("amount"))
            .order_by("-total")
        )

        total = sum(float(b["total"]) for b in breakdown)

        result = [
            {
                "category":   b["category"],
                "amount":     float(b["total"]),
                "percentage": round(float(b["total"]) / total * 100, 1) if total else 0,
            }
            for b in breakdown
        ]

        return Response({
            "year":      year,
            "month":     month,
            "total":     total,
            "breakdown": result,
        })


class YearOverYearView(APIView):
    """
    Year-over-year monthly comparison (current year vs previous year).
    GET /api/analytics/year-over-year/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today        = timezone.now().date()
        current_year = today.year
        prev_year    = current_year - 1

        def get_monthly(year):
            rows = (
                Expense.objects
                .filter(user=request.user, date__year=year)
                .exclude(**CC_EXCLUDE)      # ← CC purchases excluded
                .annotate(month=TruncMonth("date"))
                .values("month")
                .annotate(total=Sum("amount"))
                .order_by("month")
            )
            return {r["month"].month: float(r["total"]) for r in rows}

        curr_map = get_monthly(current_year)
        prev_map = get_monthly(prev_year)

        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

        result = [
            {
                "month":           months[i],
                "month_num":       i + 1,
                str(current_year): curr_map.get(i + 1, 0),
                str(prev_year):    prev_map.get(i + 1, 0),
            }
            for i in range(12)
        ]

        return Response({
            "current_year": current_year,
            "prev_year":    prev_year,
            "data":         result,
        })