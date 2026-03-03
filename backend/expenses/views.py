from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum
from django.db.models.functions import TruncMonth

from .models import Expense
from .serializers import ExpenseSerializer
from recurring_expenses.services import generate_recurring_expenses


# ==============================
# ADD EXPENSE
# ==============================

class AddExpenseView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        data = request.data.copy()
        data['user'] = request.user.id

        serializer = ExpenseSerializer(data=data)

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

    permission_classes = [IsAuthenticated]

    def get(self, request):

        generate_recurring_expenses()

        expenses = Expense.objects.filter(
            user=request.user
        ).order_by("-date")

        serializer = ExpenseSerializer(expenses, many=True)

        return Response(serializer.data)


# ==============================
# UPDATE EXPENSE
# ==============================

class UpdateExpenseView(APIView):

    permission_classes = [IsAuthenticated]

    def put(self, request, expense_id):

        try:
            expense = Expense.objects.get(id=expense_id, user=request.user)

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

    permission_classes = [IsAuthenticated]

    def delete(self, request, expense_id):

        try:
            expense = Expense.objects.get(id=expense_id, user=request.user)
            expense.delete()
            return Response({"message": "Deleted successfully"})

        except Expense.DoesNotExist:
            return Response({"error": "Not found"}, status=404)


# ==============================
# DASHBOARD
# ==============================

class DashboardView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        expenses = Expense.objects.filter(user=request.user)
        total = expenses.aggregate(total=Sum("amount"))["total"] or 0
        return Response({"total_expense": total})


# ==============================
# MONTHLY SUMMARY
# ==============================

class MonthlyExpenseSummaryView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        monthly = (
            Expense.objects
            .filter(user=request.user)
            .annotate(month=TruncMonth("date"))
            .values("month")
            .annotate(total=Sum("amount"))
            .order_by("-month")
        )

        return Response({"monthly_expenses": monthly})