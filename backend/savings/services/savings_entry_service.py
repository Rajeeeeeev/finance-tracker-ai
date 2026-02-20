from decimal import Decimal
from django.utils import timezone

from savings.models import SavingsEntry, SavingsGoal


class SavingsEntryService:

    # -----------------------------------------
    # CREATE ENTRY
    # -----------------------------------------

    @staticmethod
    def create_entry(user, validated_data):

        goal = validated_data.get("goal")

        if not goal.is_active:
            raise Exception("Cannot add entry to inactive goal")

        entry = SavingsEntry.objects.create(
            user=user,
            goal=goal,
            amount=validated_data.get("amount"),
            date=validated_data.get("date", timezone.now().date())
        )

        return entry


    # -----------------------------------------
    # UPDATE ENTRY
    # -----------------------------------------

    @staticmethod
    def update_entry(entry, validated_data):

        if not entry.is_active:
            raise Exception("Cannot update inactive entry")

        for field, value in validated_data.items():
            setattr(entry, field, value)

        entry.save()

        return entry


    # -----------------------------------------
    # SOFT DELETE ENTRY
    # -----------------------------------------

    @staticmethod
    def delete_entry(entry):

        entry.is_active = False
        entry.save()

        return entry


    # -----------------------------------------
    # GET USER ENTRIES
    # -----------------------------------------

    @staticmethod
    def get_user_entries(user):

        return SavingsEntry.objects.filter(
            user=user,
            is_active=True
        ).select_related("goal").order_by("-date")


    # -----------------------------------------
    # GET GOAL ENTRIES
    # -----------------------------------------

    @staticmethod
    def get_goal_entries(goal):

        return SavingsEntry.objects.filter(
            goal=goal,
            is_active=True
        ).order_by("-date")


    # -----------------------------------------
    # GET TOTAL SAVED FOR GOAL
    # -----------------------------------------

    @staticmethod
    def get_goal_total(goal):

        from django.db.models import Sum

        result = SavingsEntry.objects.filter(
            goal=goal,
            is_active=True
        ).aggregate(total=Sum("amount"))

        return result["total"] or Decimal("0.00")
