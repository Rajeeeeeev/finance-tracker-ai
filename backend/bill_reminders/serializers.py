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
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "expense_created",
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