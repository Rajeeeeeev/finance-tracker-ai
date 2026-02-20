from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum
from .models import BillReminder
from .serializers import BillReminderSerializer, BudgetSerializer
from .serializers import ExpenseSerializer
from datetime import date
from .models import Budget, Expense
from .models import RecurringExpense
from .serializers import RecurringExpenseSerializer
from .services import generate_recurring_expenses
from rest_framework.permissions import IsAuthenticated



class AddExpenseView(APIView):

    def post(self, request):

        serializer = ExpenseSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {"message": "Expense added successfully"},
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from .models import Expense


class ExpenseListView(APIView):

    def get(self, request):

        # ADD THIS LINE HERE (FIRST LINE)
        generate_recurring_expenses()

        user_id = request.query_params.get("user")

        if user_id:
            expenses = Expense.objects.filter(user_id=user_id).order_by("-date")
        else:
            expenses = Expense.objects.none()

        serializer = ExpenseSerializer(expenses, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


class DeleteExpenseView(APIView):

    def delete(self, request, expense_id):

        try:
            expense = Expense.objects.get(id=expense_id)
            expense.delete()

            return Response(
                {"message": "Expense deleted successfully"}, status=status.HTTP_200_OK
            )

        except Expense.DoesNotExist:
            return Response(
                {"error": "Expense not found"}, status=status.HTTP_404_NOT_FOUND
            )


class UpdateExpenseView(APIView):

    def put(self, request, expense_id):

        try:
            expense = Expense.objects.get(id=expense_id)

            serializer = ExpenseSerializer(expense, data=request.data)

            if serializer.is_valid():
                serializer.save()

                return Response(
                    {"message": "Expense updated successfully"},
                    status=status.HTTP_200_OK,
                )

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Expense.DoesNotExist:
            return Response(
                {"error": "Expense not found"}, status=status.HTTP_404_NOT_FOUND
            )


class DashboardView(APIView):

    def get(self, request):

        user_id = request.query_params.get("user")

        if not user_id:
            return Response(
                {"error": "User ID required"}, status=status.HTTP_400_BAD_REQUEST
            )

        expenses = Expense.objects.filter(user_id=user_id)

        total_expense = expenses.aggregate(total=Sum("amount"))["total"] or 0

        categories = [
            "Food",
            "Travel",
            "Shopping",
            "Bills",
            "Entertainment",
            "Health",
            "Education",
            "Groceries",
            "Rent",
            "Utilities",
            "Other",
        ]

        category_data = {}

        for category in categories:
            total = (
                expenses.filter(category=category).aggregate(total=Sum("amount"))[
                    "total"
                ]
                or 0
            )
            category_data[category] = total

        data = {"total_expense": total_expense, "categories": category_data}

        return Response(data, status=status.HTTP_200_OK)


@api_view(["POST"])
def add_bill_reminder(request):

    serializer = BillReminderSerializer(data=request.data)

    if serializer.is_valid():

        serializer.save()

        return Response(
            {"message": "Bill reminder created successfully", "data": serializer.data},
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AddBillReminderView(APIView):

    def post(self, request):

        serializer = BillReminderSerializer(data=request.data)

        if serializer.is_valid():

            serializer.save()

            return Response(
                {
                    "message": "Bill reminder created successfully",
                    "data": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    class MarkReminderPaidView(APIView):

        def put(self, request, reminder_id):

            try:
                reminder = BillReminder.objects.get(id=reminder_id)

            except BillReminder.DoesNotExist:
                return Response(
                    {"error": "Reminder not found"}, status=status.HTTP_404_NOT_FOUND
                )

            reminder.is_paid = True
            reminder.save()

            serializer = BillReminderSerializer(reminder)

            return Response(
                {"message": "Reminder marked as paid", "data": serializer.data},
                status=status.HTTP_200_OK,
            )


class ReminderListView(APIView):

    def get(self, request):

        user_id = request.query_params.get("user")

        if not user_id:
            return Response(
                {"error": "user parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reminders = BillReminder.objects.filter(user_id=user_id).order_by("due_date")

        serializer = BillReminderSerializer(reminders, many=True)

        return Response(
            {"count": reminders.count(), "reminders": serializer.data},
            status=status.HTTP_200_OK,
        )


class MarkReminderPaidView(APIView):

    def put(self, request, reminder_id):

        try:
            reminder = BillReminder.objects.get(id=reminder_id)

        except BillReminder.DoesNotExist:
            return Response(
                {"error": "Reminder not found"}, status=status.HTTP_404_NOT_FOUND
            )

        reminder.is_paid = True
        reminder.save()

        serializer = BillReminderSerializer(reminder)

        return Response(
            {"message": "Reminder marked as paid", "data": serializer.data},
            status=status.HTTP_200_OK,
        )


from datetime import date


class OverdueReminderView(APIView):

    def get(self, request):

        user_id = request.query_params.get("user")

        if not user_id:
            return Response(
                {"error": "user parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        today = date.today()

        overdue_reminders = BillReminder.objects.filter(
            user_id=user_id, due_date__lt=today, is_paid=False
        ).order_by("due_date")

        serializer = BillReminderSerializer(overdue_reminders, many=True)

        return Response(
            {"count": overdue_reminders.count(), "overdue_reminders": serializer.data},
            status=status.HTTP_200_OK,
        )


from datetime import timedelta


def calculate_next_due_date(current_due_date, frequency):

    if frequency == "DAILY":
        return current_due_date + timedelta(days=1)

    elif frequency == "WEEKLY":
        return current_due_date + timedelta(weeks=1)

    elif frequency == "MONTHLY":
        return current_due_date + timedelta(days=30)

    elif frequency == "YEARLY":
        return current_due_date + timedelta(days=365)

    return None


class GenerateRecurringRemindersView(APIView):

    def post(self, request):

        reminders = BillReminder.objects.filter(reminder_type="RECURRING", is_paid=True)

        created_reminders = []

        for reminder in reminders:

            next_due_date = calculate_next_due_date(
                reminder.due_date, reminder.frequency
            )

            new_reminder = BillReminder.objects.create(
                user=reminder.user,
                title=reminder.title,
                amount=reminder.amount,
                due_date=next_due_date,
                reminder_type="RECURRING",
                frequency=reminder.frequency,
                is_paid=False,
            )

            created_reminders.append(new_reminder.id)

        return Response(
            {
                "message": "Recurring reminders generated",
                "created_ids": created_reminders,
            }
        )


class SetBudgetView(APIView):

    def post(self, request):

        serializer = BudgetSerializer(data=request.data)

        if serializer.is_valid():

            serializer.save()

            return Response(
                {"message": "Budget set successfully", "data": serializer.data},
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BudgetStatusView(APIView):

    def get(self, request):

        user_id = request.query_params.get("user")

        if not user_id:
            return Response(
                {"error": "user parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        current_month = date.today().month
        current_year = date.today().year

        budgets = Budget.objects.filter(user_id=user_id)

        result = []

        for budget in budgets:

            spent = (
                Expense.objects.filter(
                    user_id=user_id,
                    category=budget.category,
                    date__month=current_month,
                    date__year=current_year,
                ).aggregate(total=Sum("amount"))["total"]
                or 0
            )

            remaining = budget.monthly_limit - spent

            percentage = (
                (spent / budget.monthly_limit) * 100 if budget.monthly_limit > 0 else 0
            )

            result.append(
                {
                    "category": budget.category,
                    "monthly_limit": budget.monthly_limit,
                    "spent": spent,
                    "remaining": remaining,
                    "usage_percentage": round(percentage, 2),
                }
            )

        return Response({"budget_status": result}, status=status.HTTP_200_OK)
class OverspendingAlertView(APIView):

    def get(self, request):

        user_id = request.query_params.get("user")

        if not user_id:
            return Response(
                {"error": "user parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        current_month = date.today().month
        current_year = date.today().year

        budgets = Budget.objects.filter(user_id=user_id)

        alerts = []

        for budget in budgets:

            spent = Expense.objects.filter(
                user_id=user_id,
                category=budget.category,
                date__month=current_month,
                date__year=current_year
            ).aggregate(total=Sum("amount"))["total"] or 0

            if spent > budget.monthly_limit:

                alerts.append({
                    "category": budget.category,
                    "monthly_limit": budget.monthly_limit,
                    "spent": spent,
                    "overspent_amount": spent - budget.monthly_limit
                })

        return Response(
            {
                "overspending_alerts": alerts
            },
            status=status.HTTP_200_OK
        )

class RecurringExpenseListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        recurring = RecurringExpense.objects.filter(user=request.user)

        serializer = RecurringExpenseSerializer(recurring, many=True)

        return Response(serializer.data)


    def post(self, request):

        serializer = RecurringExpenseSerializer(data=request.data)

        if serializer.is_valid():

            serializer.save(user=request.user)

            return Response(serializer.data)
        

class RecurringExpenseDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def put(self, request, pk):

        recurring = RecurringExpense.objects.get(
            pk=pk,
            user=request.user
        )

        serializer = RecurringExpenseSerializer(
            recurring,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(serializer.errors, status=400)


    def delete(self, request, pk):

        recurring = RecurringExpense.objects.get(
            pk=pk,
            user=request.user
        )

        recurring.delete()

        return Response({"message": "Deleted"})