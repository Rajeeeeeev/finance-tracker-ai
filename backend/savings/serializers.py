from rest_framework import serializers
from savings.models import SavingsGoal, SavingsEntry


# -----------------------------------------
# SAVINGS GOAL SERIALIZER
# -----------------------------------------

class SavingsGoalSerializer(serializers.ModelSerializer):

    class Meta:
        model = SavingsGoal
        fields = [
            "id",
            "name",
            "target_amount",
            "start_date",
            "end_date",
            "status",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "status",
            "is_active",
            "created_at",
            "updated_at",
        ]

    def validate(self, data):

        start_date = data.get("start_date")
        end_date = data.get("end_date")

        if start_date >= end_date:
            raise serializers.ValidationError(
                "End date must be greater than start date"
            )

        return data


# -----------------------------------------
# SAVINGS ENTRY SERIALIZER
# -----------------------------------------

class SavingsEntrySerializer(serializers.ModelSerializer):

    class Meta:
        model = SavingsEntry

        fields = [
            "id",
            "goal",
            "amount",
            "date",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]


# -----------------------------------------
# SAVINGS GOAL SUMMARY SERIALIZER (FIX)
# -----------------------------------------

class SavingsGoalSummarySerializer(serializers.Serializer):

    goal_id = serializers.IntegerField()

    goal_name = serializers.CharField()

    target_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    total_saved = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    remaining_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    monthly_target = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    saved_this_month = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    total_progress_percentage = serializers.DecimalField(
        max_digits=6,
        decimal_places=2
    )

    monthly_progress_percentage = serializers.DecimalField(
        max_digits=6,
        decimal_places=2
    )

    status = serializers.CharField()

    start_date = serializers.DateField()

    end_date = serializers.DateField()
