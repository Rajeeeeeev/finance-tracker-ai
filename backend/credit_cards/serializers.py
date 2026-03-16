from rest_framework import serializers
from .models import CreditCard
from expenses.models import Expense
from decimal import Decimal
from django.db.models import Sum
import datetime
import calendar


class CreditCardSerializer(serializers.ModelSerializer):
    current_balance     = serializers.SerializerMethodField()
    available_credit    = serializers.SerializerMethodField()
    utilization_percent = serializers.SerializerMethodField()
    next_due_date       = serializers.SerializerMethodField()
    minimum_due         = serializers.SerializerMethodField()

    class Meta:
        model  = CreditCard
        fields = [
            'id', 'card_name', 'bank_name', 'card_network',
            'last_four_digits', 'credit_limit', 'billing_date',
            'due_date_days', 'interest_rate', 'is_active',
            'current_balance', 'available_credit', 'utilization_percent',
            'next_due_date', 'minimum_due', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def _safe_replace_day(self, date, day):
        max_day = calendar.monthrange(date.year, date.month)[1]
        return date.replace(day=min(day, max_day))

    def _get_cycle_start(self, obj):
        today = datetime.date.today()
        if today.day >= obj.billing_date:
            return self._safe_replace_day(today, obj.billing_date)
        first      = today.replace(day=1)
        prev_month = first - datetime.timedelta(days=1)
        return self._safe_replace_day(prev_month, obj.billing_date)

    def get_current_balance(self, obj):
        cycle_start = self._get_cycle_start(obj)
        total = obj.expenses.filter(date__gte=cycle_start).aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')
        return float(total)

    def get_available_credit(self, obj):
        return float(obj.credit_limit) - self.get_current_balance(obj)

    def get_utilization_percent(self, obj):
        if not obj.credit_limit:
            return 0
        return round(self.get_current_balance(obj) / float(obj.credit_limit) * 100, 2)

    def get_next_due_date(self, obj):
        cycle_start = self._get_cycle_start(obj)
        due = cycle_start + datetime.timedelta(days=obj.due_date_days)
        return due.strftime('%Y-%m-%d')

    def get_minimum_due(self, obj):
        return round(self.get_current_balance(obj) * 0.05, 2)


class CreditCardExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Expense
        fields = ['id', 'amount', 'category', 'description', 'date', 'payment_method']