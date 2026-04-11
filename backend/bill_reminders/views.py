from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import date
from rest_framework.permissions import IsAuthenticated
from .models import BillReminder
from .serializers import BillReminderSerializer
from .services import generate_next_recurring_reminder
from expenses.models import Expense


class AddBillReminderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data.copy()
        data['user'] = request.user.id

        serializer = BillReminderSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReminderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reminders = BillReminder.objects.filter(
            user=request.user
        ).order_by("due_date")
        serializer = BillReminderSerializer(reminders, many=True)
        return Response(serializer.data)


class MarkReminderPaidView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, reminder_id):
        try:
            reminder = BillReminder.objects.get(id=reminder_id, user=request.user)
        except BillReminder.DoesNotExist:
            return Response(
                {"error": "Reminder not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Mark as paid
        reminder.is_paid = True
        reminder.expense_created = True
        reminder.save()

        # Build the expense description
        if reminder.related_credit_card:
            card = reminder.related_credit_card
            description = f"{card.card_name} ****{card.last_four_digits} Credit Card Bill"
            payment_method = "Bank Transfer"
        else:
            description = reminder.bill_name
            payment_method = "UPI"

        # Create the payment expense.
        # credit_card=None is critical — it prevents the post_save signal
        # on Expense from creating a duplicate bill reminder for this card.
        # source="BILL" is the second guard (signal checks this too).
        Expense.objects.create(
            user=reminder.user,
            amount=reminder.amount,
            category="Bills",
            payment_method=payment_method,
            description=description,
            date=date.today(),
            source="BILL",
            credit_card=None,   # Must stay None — do NOT set this to the card
        )

        # Auto-generate next reminder if recurring.
        # For credit card reminders: the NEXT reminder will be created
        # naturally by the Expense post_save signal when the user makes
        # their next purchase — so we skip auto-generation for CC reminders
        # to avoid creating an empty ₹0 reminder immediately.
        next_reminder = None
        if reminder.is_recurring:
            if reminder.related_credit_card:
                # Credit card bills: don't pre-create next reminder here.
                # The signal will create it when the next expense is recorded.
                next_reminder = None
            else:
                # Regular recurring bills (rent, internet, etc.): generate next
                next_reminder = generate_next_recurring_reminder(reminder)

        serializer = BillReminderSerializer(reminder)
        return Response({
            "message": "Marked as paid",
            "reminder": serializer.data,
            "expense_created": True,
            "next_reminder_created": next_reminder is not None,
            "next_reminder": BillReminderSerializer(next_reminder).data if next_reminder else None,
        })


class DeleteBillReminderView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, reminder_id):
        try:
            reminder = BillReminder.objects.get(id=reminder_id, user=request.user)
            reminder.delete()
            return Response(
                {"message": "Reminder deleted successfully"},
                status=status.HTTP_200_OK,
            )
        except BillReminder.DoesNotExist:
            return Response(
                {"error": "Reminder not found"},
                status=status.HTTP_404_NOT_FOUND,
            )


class UpdateBillReminderView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, reminder_id):
        try:
            reminder = BillReminder.objects.get(id=reminder_id, user=request.user)
        except BillReminder.DoesNotExist:
            return Response(
                {"error": "Reminder not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = BillReminderSerializer(reminder, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Reminder updated successfully",
                "data": serializer.data,
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)