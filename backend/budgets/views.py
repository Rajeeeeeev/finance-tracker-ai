from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum
from datetime import date

from .models import Budget
from .serializers import BudgetSerializer
from expenses.models import Expense


class SetBudgetView(APIView):


    permission_classes = [IsAuthenticated]

    def post(self, request):

        category = request.data.get("category")
        monthly_limit = request.data.get("monthly_limit")

        budget, created = Budget.objects.update_or_create(
            user=request.user,
            category=category,
            defaults={
                "monthly_limit": monthly_limit
            }
        )
        return Response({
            "message": "Budget set successfully",
            "category": category,
            "monthly_limit": budget.monthly_limit
        })    


from datetime import date
from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Budget
from expenses.models import Expense


class BudgetStatusView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        today = date.today()
        current_month = today.month
        current_year = today.year

        budgets = Budget.objects.filter(user=user)

        result = []

        for budget in budgets:

            total_spent = Expense.objects.filter(
                user=user,
                category=budget.category,
                created_at__year=current_year,     # FIX HERE
                created_at__month=current_month    # FIX HERE
            ).aggregate(total=Sum("amount"))["total"] or 0

            remaining = budget.monthly_limit - total_spent

            percentage = 0
            if budget.monthly_limit > 0:
                percentage = (total_spent / budget.monthly_limit) * 100

            if total_spent > budget.monthly_limit:
                status = "EXCEEDED"
            elif percentage >= 80:
                status = "WARNING"
            else:
                status = "SAFE"

            result.append({
                "category": budget.category,
                "monthly_limit": float(budget.monthly_limit),
                "spent": float(total_spent),
                "remaining": float(remaining),
                "percentage": round(float(percentage), 2),
                "status": status
            })

        return Response(result)