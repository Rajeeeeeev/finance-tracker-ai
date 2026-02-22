from decimal import Decimal
from django.db.models import Sum
from django.utils import timezone
from dateutil.relativedelta import relativedelta

from savings.models import SavingsGoal, SavingsEntry


class SavingsGoalService:

    @staticmethod
    def create_goal(user, validated_data):
        return SavingsGoal.objects.create(
            user=user,
            **validated_data
        )

    @staticmethod
    def update_goal(goal, validated_data):
        for field, value in validated_data.items():
            setattr(goal, field, value)

        goal.save()
        return goal

    @staticmethod
    def soft_delete_goal(goal):
        goal.is_active = False
        goal.status = SavingsGoal.Status.CANCELLED
        goal.save()
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

        total_saved = SavingsGoalService.get_total_saved(goal)

        remaining_amount = SavingsGoalService.get_remaining_amount(goal)

        monthly_target = SavingsGoalService.calculate_monthly_target(goal)

        saved_this_month = SavingsGoalService.get_saved_this_month(goal)

        total_progress = SavingsGoalService.get_total_progress_percentage(goal)

        monthly_progress = SavingsGoalService.get_monthly_progress_percentage(goal)

        status = SavingsGoalService.get_goal_status(goal)
        is_completed = total_saved >= goal.target_amount


        return {

            "goal_id": goal.id,
            "goal_name": goal.name,

            "target_amount": goal.target_amount,

            "total_saved": total_saved,

            "remaining_amount": remaining_amount,

            "monthly_target": monthly_target,

            "saved_this_month": saved_this_month,

            "total_progress_percentage": total_progress,

            "monthly_progress_percentage": monthly_progress,

            "status": status,
            "is_completed": is_completed,   # ADD THIS LINE
            "start_date": goal.start_date,
            "end_date": goal.end_date,
        }
