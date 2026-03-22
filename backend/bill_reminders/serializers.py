from rest_framework import serializers
from .models import BillReminder


class BillReminderSerializer(serializers.ModelSerializer):
    days_until_due = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = BillReminder
        fields = [
            'id',
            'bill_name',
            'category',
            'amount',
            'due_date',
            'is_paid',
            'is_recurring',
            'frequency',
            'recurring_until_date',
            'notes',
            'related_credit_card',
            'parent_reminder',
            'expense_created',
            'days_until_due',
            'is_overdue',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'expense_created',
            'parent_reminder',
            'days_until_due',
            'is_overdue',
        ]

    def get_days_until_due(self, obj):
        """Return days until due (None if paid or overdue)"""
        return obj.days_until_due

    def get_is_overdue(self, obj):
        """Return if bill is overdue"""
        return obj.is_overdue