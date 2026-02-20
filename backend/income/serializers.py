from rest_framework import serializers
from .models import Income


class IncomeSerializer(serializers.ModelSerializer):

    class Meta:

        model = Income

        fields = [
            "id",
            "user",
            "source_name",
            "income_type",
            "amount",
            "date",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]
