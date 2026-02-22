from decimal import Decimal
from django.db import transaction
from django.db.models import Sum
from django.forms import ValidationError
from django.utils import timezone
from dateutil.relativedelta import relativedelta

from savings.models import SavingsGoal, SavingsEntry


class SavingsGoalService:

      # -----------------------------------------
    # CREATE GOAL
    # -----------------------------------------
    @staticmethod
    @transaction.atomic
    def create_goal(*, user, validated_data):

        # Only allow safe fields
        allowed_fields = {
            "name": validated_data["name"],
            "target_amount": validated_data["target_amount"],
            "start_date": validated_data["start_date"],
            "end_date": validated_data["end_date"],
        }

        # Optional: prevent duplicate active goals with same name
        if SavingsGoal.objects.filter(
            user=user,
            name=allowed_fields["name"],
            is_active=True
        ).exists():
            raise ValidationError("Active goal with this name already exists.")

        goal = SavingsGoal.objects.create(
            user=user,
            **allowed_fields
        )

        return goal


    # -----------------------------------------
    # UPDATE GOAL
    # -----------------------------------------
    @staticmethod
    @transaction.atomic
    def update_goal(goal, validated_data):

        # Only allow safe fields to be updated
        allowed_update_fields = [
            "name",
            "target_amount",
            "start_date",
            "end_date",
        ]

        for field in allowed_update_fields:

            if field in validated_data:
                setattr(goal, field, validated_data[field])

        goal.save(update_fields=allowed_update_fields)

        return goal


    # -----------------------------------------
    # SOFT DELETE GOAL
    # -----------------------------------------
    @staticmethod
    @transaction.atomic
    def soft_delete_goal(goal):

        if not goal.is_active:
            raise ValidationError("Goal is already inactive.")

        goal.is_active = False
        goal.status = SavingsGoal.Status.CANCELLED

        goal.save(update_fields=["is_active", "status"])

        return goal


    # -----------------------------------------
    # CORE CALCULATION METHODS
    # -----------------------------------------

    @staticmethod
    def get_total_saved(goal):

        result = SavingsEntry.objects.filter(
            goal=goal,
            is_active=True
        ).aggregate(total=Sum("amount"))

        return result["total"] or Decimal("0.00")


    @staticmethod
    def get_remaining_amount(goal):

        total_saved = SavingsGoalService.get_total_saved(goal)

        remaining = goal.target_amount - total_saved

        return max(remaining, Decimal("0.00"))


    @staticmethod
    def get_total_months(goal):

        start = goal.start_date
        end = goal.end_date

        months = (end.year - start.year) * 12 + (end.month - start.month)

        return max(months, 1)


    @staticmethod
    def get_remaining_months(goal):

        today = timezone.now().date()

        if today >= goal.end_date:
            return 1

        months = (goal.end_date.year - today.year) * 12 + (goal.end_date.month - today.month)

        return max(months, 1)


    @staticmethod
    def calculate_monthly_target(goal):

        remaining_amount = SavingsGoalService.get_remaining_amount(goal)

        remaining_months = SavingsGoalService.get_remaining_months(goal)

        monthly_target = remaining_amount / Decimal(remaining_months)

        return monthly_target.quantize(Decimal("0.01"))


    @staticmethod
    def get_saved_this_month(goal):

        today = timezone.now().date()

        result = SavingsEntry.objects.filter(
            goal=goal,
            is_active=True,
            date__year=today.year,
            date__month=today.month
        ).aggregate(total=Sum("amount"))

        return result["total"] or Decimal("0.00")


    # -----------------------------------------
    # PROGRESS CALCULATIONS
    # -----------------------------------------

    @staticmethod
    def get_total_progress_percentage(goal):

        total_saved = SavingsGoalService.get_total_saved(goal)

        if goal.target_amount == 0:
            return Decimal("0.00")

        progress = (total_saved / goal.target_amount) * 100

        return progress.quantize(Decimal("0.01"))


    @staticmethod
    def get_monthly_progress_percentage(goal):

        saved_this_month = SavingsGoalService.get_saved_this_month(goal)

        monthly_target = SavingsGoalService.calculate_monthly_target(goal)

        if monthly_target == 0:
            return Decimal("0.00")

        progress = (saved_this_month / monthly_target) * 100

        return progress.quantize(Decimal("0.01"))


    @staticmethod
    def get_goal_status(goal):

        monthly_progress = SavingsGoalService.get_monthly_progress_percentage(goal)

        if monthly_progress >= 100:
            return "AHEAD"

        elif monthly_progress >= 75:
            return "ON_TRACK"

        else:
            return "BEHIND"


    # -----------------------------------------
    # MASTER SUMMARY METHOD
    # -----------------------------------------

    @staticmethod
    def get_goal_summary(goal):

        today = timezone.now().date()

        # -----------------------------------
        # TOTAL SAVED
        # -----------------------------------

        total_saved = SavingsEntry.objects.filter(
            goal=goal,
            user=goal.user,
            is_active=True
        ).aggregate(
            total=Sum("amount")
        )["total"] or Decimal("0")

        # -----------------------------------
        # SAVED THIS MONTH
        # -----------------------------------

        saved_this_month = SavingsEntry.objects.filter(
            goal=goal,
            user=goal.user,
            is_active=True,
            date__year=today.year,
            date__month=today.month
        ).aggregate(
            total=Sum("amount")
        )["total"] or Decimal("0")

        # -----------------------------------
        # REMAINING
        # -----------------------------------

        remaining_amount = goal.target_amount - total_saved

        # -----------------------------------
        # MONTH CALCULATION
        # -----------------------------------

        total_months = max(
            1,
            (goal.end_date.year - goal.start_date.year) * 12 +
            (goal.end_date.month - goal.start_date.month)
        )

        monthly_target = goal.target_amount / Decimal(total_months)

        # -----------------------------------
        # PROGRESS CALCULATIONS
        # -----------------------------------

        total_progress_percentage = Decimal("0")
        if goal.target_amount > 0:
            total_progress_percentage = (
                total_saved / goal.target_amount
            ) * 100

        monthly_progress_percentage = Decimal("0")
        if monthly_target > 0:
            monthly_progress_percentage = (
                saved_this_month / monthly_target
            ) * 100

        # -----------------------------------
        # COMPLETION STATUS
        # -----------------------------------

        is_completed = total_saved >= goal.target_amount

        return {
            "goal_id": goal.id,
            "goal_name": goal.name,
            "target_amount": goal.target_amount,

            "total_saved": total_saved,

            "remaining_amount": remaining_amount,

            "monthly_target": monthly_target,

            "saved_this_month": saved_this_month,

            "total_progress_percentage": round(
                total_progress_percentage, 2
            ),

            "monthly_progress_percentage": round(
                monthly_progress_percentage, 2
            ),

            "is_completed": is_completed,

            "status": "COMPLETED" if is_completed else goal.status,

            "start_date": goal.start_date,
            "end_date": goal.end_date,
        }