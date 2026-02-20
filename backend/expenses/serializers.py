from rest_framework import serializers
from .models import Expense
from .models import BillReminder




class ExpenseSerializer(serializers.ModelSerializer):

    class Meta:
        model = Expense
        fields = ['id', 'user', 'amount', 'category', 'payment_method', 'description', 'date']

class BillReminderSerializer(serializers.ModelSerializer):

    class Meta:
        model = BillReminder

        fields = [
            "id",
            "user",
            "title",
            "amount",
            "due_date",
            "reminder_type",
            "frequency",
            "is_paid",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]
    def validate(self, data):

        reminder_type = data.get("reminder_type")
        frequency = data.get("frequency")

        if reminder_type == "RECURRING" and not frequency:
            raise serializers.ValidationError(
                "Frequency is required for recurring reminders."
            )

        if reminder_type == "ONE_TIME":
            data["frequency"] = None

        return data

from .models import Budget


class BudgetSerializer(serializers.ModelSerializer):

    class Meta:
        model = Budget

        fields = [
            "id",
            "user",
            "category",
            "monthly_limit",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]
from .models import RecurringExpense


class RecurringExpenseSerializer(serializers.ModelSerializer):

    class Meta:
        model = RecurringExpense
        fields = "__all__"
        read_only_fields = ("user", "last_generated_date", "created_at", "updated_at")
