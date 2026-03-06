from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import date, timedelta
from rest_framework.permissions import IsAuthenticated
from .models import BillReminder
from .serializers import BillReminderSerializer
from expenses.models import Expense


class AddBillReminderView(APIView):

    def post(self, request):

        serializer = BillReminderSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)


class ReminderListView(APIView):

    def get(self, request):

        user_id = request.query_params.get("user")

        reminders = BillReminder.objects.filter(user_id=user_id)

        serializer = BillReminderSerializer(reminders, many=True)

        return Response(serializer.data)


class MarkReminderPaidView(APIView):

    def put(self, request, reminder_id):

        try:
            reminder = BillReminder.objects.get(id=reminder_id)
        except BillReminder.DoesNotExist:
            return Response({"error": "Reminder not found"}, status=404)

        reminder.is_paid = True
        reminder.expense_created = True
        reminder.save()

        # ── Build expense description ─────────────────────────────────────────
        # If this reminder is linked to a credit card, use card details in
        # the description and link the expense back to the card too.
        if reminder.related_credit_card:
            card = reminder.related_credit_card
            description = f"{card.card_name} ****{card.last_four_digits} Credit Card Bill"
            credit_card = card
            payment_method = "Bank Transfer"  # credit card bills are usually paid via bank transfer
        else:
            description = reminder.title
            credit_card = None
            payment_method = "UPI"

        # ── Create the expense entry ──────────────────────────────────────────
        Expense.objects.create(
            user=reminder.user,
            amount=reminder.amount,
            category="Bills",
            payment_method=payment_method,
            description=description,
            date=date.today(),
            source="BILL",
            credit_card=credit_card,   # None for regular bills, card for CC bills
        )

        return Response({
            "message": "Marked paid",
            "expense_created": True,
            "description": description,
        })


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


class UpdateBillReminderView(APIView):

     permission_classes = [IsAuthenticated]

     def put(self, request, reminder_id):

        try:
            reminder = BillReminder.objects.get(
                id=reminder_id,
                user=request.user
            )

        except BillReminder.DoesNotExist:
            return Response(
                {"error": "Reminder not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = BillReminderSerializer(
            reminder,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "message": "Reminder updated successfully",
                    "data": serializer.data
                }
            )

        return Response(serializer.errors, status=400)
