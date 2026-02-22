from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from datetime import date

from .models import Budget
from .serializers import BudgetSerializer
from expenses.models import Expense


class SetBudgetView(APIView):

    def post(self, request):

        serializer = BudgetSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors)


class BudgetStatusView(APIView):

    def get(self, request):

        user_id = request.query_params.get("user")

        budgets = Budget.objects.filter(user_id=user_id)

        current_month = date.today().month
        current_year = date.today().year

        result = []

        for budget in budgets:

            spent = (
                Expense.objects
                .filter(
                    user_id=user_id,
                    category=budget.category,
                    date__month=current_month,
                    date__year=current_year
                )
                .aggregate(total=Sum("amount"))["total"] or 0
            )

            result.append({
                "category": budget.category,
                "limit": budget.monthly_limit,
                "spent": spent
            })

        return Response(result)