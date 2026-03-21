from rest_framework import serializers
from .models import Expense


class ExpenseSerializer(serializers.ModelSerializer):

    class Meta:
        model = Expense

        fields = [
            "id",
            "user",
            "amount",
            "category",
            "payment_method",
            "description",
            "date",
            "source",
            "recurring_expense",
            "liability",
            "credit_card",  # ✅ ADD THIS LINE
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]