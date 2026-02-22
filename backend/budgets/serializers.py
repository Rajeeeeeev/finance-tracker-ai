from rest_framework import serializers
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
            "user"
            "id",
            "created_at",
            "updated_at",
        ]