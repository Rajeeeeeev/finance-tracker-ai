from rest_framework import serializers
from .models import Investment


class InvestmentSerializer(serializers.ModelSerializer):

    class Meta:

        model = Investment

        fields = "__all__"

        read_only_fields = (

            # Ownership — set automatically from request.user in the view
            "user",

            # Calculated automatically by the model on save
            "profit_loss",
            "profit_loss_percentage",

            # Timestamps — auto-managed by the model
            "invested_amount_updated_at",
            "current_amount_updated_at",
            "created_at",
            "updated_at",

        )