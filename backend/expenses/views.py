from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum
from django.db.models.functions import TruncMonth
from datetime import date

from .models import Expense
from .serializers import ExpenseSerializer
from recurring_expenses.services import generate_recurring_expenses


# ==============================
# ADD EXPENSE
# ==============================

class AddExpenseView(APIView):

    def post(self, request):

        serializer = ExpenseSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {"message": "Expense added successfully"},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==============================
# LIST EXPENSES
# ==============================

class ExpenseListView(APIView):

    def get(self, request):

        generate_recurring_expenses()

        user_id = request.query_params.get("user")

        if not user_id:
            return Response({"error": "user parameter required"}, status=400)

        expenses = Expense.objects.filter(
            user_id=user_id
        ).order_by("-date")

        serializer = ExpenseSerializer(expenses, many=True)

        return Response(serializer.data)


# ==============================
# UPDATE EXPENSE
# ==============================

class UpdateExpenseView(APIView):

    def put(self, request, expense_id):

        try:
            expense = Expense.objects.get(id=expense_id)

        except Expense.DoesNotExist:
            return Response({"error": "Expense not found"}, status=404)

        serializer = ExpenseSerializer(
            expense,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Updated successfully"})

        return Response(serializer.errors, status=400)


# ==============================
# DELETE EXPENSE
# ==============================

class DeleteExpenseView(APIView):

    def delete(self, request, expense_id):

        try:
            expense = Expense.objects.get(id=expense_id)
            expense.delete()

            return Response({"message": "Deleted successfully"})

        except Expense.DoesNotExist:
            return Response({"error": "Not found"}, status=404)


# ==============================
# DASHBOARD
# ==============================

class DashboardView(APIView):

    def get(self, request):

        user_id = request.query_params.get("user")

        expenses = Expense.objects.filter(user_id=user_id)

        total = expenses.aggregate(total=Sum("amount"))["total"] or 0

        return Response({"total_expense": total})


# ==============================
# MONTHLY SUMMARY
# ==============================

class MonthlyExpenseSummaryView(APIView):

    def get(self, request):

        user_id = request.query_params.get("user")

        monthly = (
            Expense.objects
            .filter(user_id=user_id)
            .annotate(month=TruncMonth("date"))
            .values("month")
            .annotate(total=Sum("amount"))
            .order_by("-month")
        )

        return Response({"monthly_expenses": monthly})