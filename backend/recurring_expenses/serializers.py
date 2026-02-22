from rest_framework import serializers
from .models import RecurringExpense


class RecurringExpenseSerializer(serializers.ModelSerializer):

    class Meta:

        model = RecurringExpense

        fields = [
            "id",
            "user",
            "title",
            "amount",
            "category",
            "payment_method",
            "frequency",
            "start_date",
            "last_generated_date",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "user",
            "last_generated_date",
            "created_at",
            "updated_at",
        ]