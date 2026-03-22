from rest_framework import serializers
from liabilities.models import Liability


class LiabilitySerializer(serializers.ModelSerializer):

    class Meta:

        model = Liability

        fields = [
            "id",
            "name",
            "liability_type",
            "principal_amount",
            "interest_rate",
            "tenure_months",
            "emi_amount",
            "total_interest",
            "total_payable",
            "remaining_principal",
            "remaining_months",
            "start_date",
            "end_date",
            "is_active",       # FIXED: was missing — frontend always got undefined → all loans showed as closed
            "created_at",
        ]

        read_only_fields = [
            "emi_amount",
            "total_interest",
            "total_payable",
            "remaining_principal",
            "remaining_months",
            "end_date",
            "is_active",
            "created_at",
        ]