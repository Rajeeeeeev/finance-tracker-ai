from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum
from django.db.models.functions import TruncMonth

from .models import Expense
from .serializers import ExpenseSerializer
from recurring_expenses.services import generate_recurring_expenses


# Expenses with this source are credit card purchases.
# They are stored for card-level tracking but must NEVER be included
# in the user's real expense totals. Only the BILL source expense
# (created when the user pays their credit card bill) counts as real spending.
CC_EXCLUDE = {"source": "CREDIT_CARD"}


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
            expense = serializer.save()

            # If the user paid with a credit card, mark it as a
            # CREDIT_CARD source so it is excluded from all totals.
            # The real expense will be recorded when they pay the bill.
            if expense.payment_method == "Credit Card":
                expense.source = "CREDIT_CARD"
                expense.save()

            return Response(
                {"message": "Expense added successfully"},
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==============================
# LIST EXPENSES
# ==============================

class ExpenseListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        generate_recurring_expenses()

        # Return ALL expenses including CREDIT_CARD ones so the user
        # can see their card spending history. The frontend should
        # visually distinguish them (e.g. a "CC Purchase" badge).
        # Only aggregates/totals exclude CREDIT_CARD rows.
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

        serializer = ExpenseSerializer(expense, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()

            # Keep source consistent with payment method
            if updated.payment_method == "Credit Card":
                updated.source = "CREDIT_CARD"
            elif updated.source == "CREDIT_CARD":
                # Payment method changed away from Credit Card
                updated.source = "MANUAL"

            updated.save()
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
        total = (
            Expense.objects
            .filter(user=request.user)
            .exclude(**CC_EXCLUDE)      # ← exclude CC purchases
            .aggregate(total=Sum("amount"))["total"] or 0
        )
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
            .exclude(**CC_EXCLUDE)      # ← exclude CC purchases
            .annotate(month=TruncMonth("date"))
            .values("month")
            .annotate(total=Sum("amount"))
            .order_by("-month")
        )
        return Response({"monthly_expenses": list(monthly)})