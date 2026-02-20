from rest_framework import serializers
from .models import Investment


class InvestmentSerializer(serializers.ModelSerializer):

    class Meta:

        model = Investment

        fields = "__all__"

        read_only_fields = (

            "profit_loss",
            "profit_loss_percentage",
            "invested_amount_updated_at",
            "current_amount_updated_at",
            "created_at",
            "updated_at"

        )
