from rest_framework import serializers
from .models import BillReminder


class BillReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = BillReminder
        fields = [
            'id',
            'user',
            'title',
            'amount',
            'due_date',
            'is_paid',
            'is_recurring',
            'frequency',
            'related_credit_card',
            'notes',
            'expense_created',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'expense_created']