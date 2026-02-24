from rest_framework import serializers


class BillSummarySerializer(serializers.Serializer):

    paid_count = serializers.IntegerField()
    paid_amount = serializers.DecimalField(max_digits=14, decimal_places=2)
    pending_count = serializers.IntegerField()
    pending_amount = serializers.DecimalField(max_digits=14, decimal_places=2)


class FinancialSummarySerializer(serializers.Serializer):

    period = serializers.CharField()
    total_income = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_expenses = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_recurring_expenses = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_savings = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_liability_payments = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_invested = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_investment_current_value = serializers.DecimalField(max_digits=12, decimal_places=2)
    bills = BillSummarySerializer()
    net_balance = serializers.DecimalField(max_digits=14, decimal_places=2)
    message = serializers.CharField()
    total_remaining_principal = serializers.DecimalField(max_digits=14, decimal_places=2)
    net_worth = serializers.DecimalField(max_digits=14, decimal_places=2)