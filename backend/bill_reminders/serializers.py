from rest_framework import serializers
from .models import BillReminder


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
            "expense_created",
            "created_at",
            "updated_at",
            "related_credit_card",  # ← NEW
            "notes",                # ← NEW
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "expense_created",
            "related_credit_card",  # ← auto-set by system, not user
            "notes",                # ← auto-set by system, not user
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