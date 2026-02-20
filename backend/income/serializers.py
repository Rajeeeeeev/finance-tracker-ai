from rest_framework import serializers
from .models import Income


class IncomeSerializer(serializers.ModelSerializer):

    income_type_name = serializers.CharField(
        source="income_type.name",
        read_only=True
    )

    class Meta:
        model = Income

        fields = [
            "id",
            "income_type",
            "income_type_name",
            "amount",
            "source_name",   # ✅ correct field name
            "date",
            "created_at",
            "updated_at"
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at"
        ]

    def create(self, validated_data):

        validated_data["user"] = self.context["request"].user

        return super().create(validated_data)
