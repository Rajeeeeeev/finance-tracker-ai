from decimal import Decimal
from django.db.models import Sum

from liabilities.models import Liability
from liabilities.services.emi_service import EMIService


class LiabilityService:

    # -----------------------------------------
    # CREATE LIABILITY
    # -----------------------------------------

    @staticmethod
    def create_liability(user, validated_data):

        principal = validated_data.get("principal_amount")
        interest_rate = validated_data.get("interest_rate")
        tenure_months = validated_data.get("tenure_months")
        start_date = validated_data.get("start_date")
        name = validated_data.get("name")

        liability_type = validated_data.get(
            "liability_type",
            Liability.LiabilityType.OTHER
        )

        # Calculate EMI
        emi = EMIService.calculate_emi(
            principal,
            interest_rate,
            tenure_months
        )

        # Calculate totals
        total_payable = EMIService.calculate_total_payable(
            emi,
            tenure_months
        )

        total_interest = EMIService.calculate_total_interest(
            total_payable,
            principal
        )

        end_date = EMIService.calculate_end_date(
            start_date,
            tenure_months
        )

        remaining_months = EMIService.calculate_remaining_months(
            start_date,
            tenure_months
        )

        liability = Liability.objects.create(

            user=user,

            name=name,

            liability_type=liability_type,

            principal_amount=principal,

            interest_rate=interest_rate,

            tenure_months=tenure_months,

            emi_amount=emi,

            total_payable=total_payable,

            total_interest=total_interest,

            remaining_principal=principal,

            start_date=start_date,

            end_date=end_date,

            remaining_months=remaining_months,

            is_active=True,
        )

        return liability


    # -----------------------------------------
    # UPDATE LIABILITY
    # -----------------------------------------

    @staticmethod
    def update_liability(liability, validated_data):

        liability.name = validated_data.get(
            "name",
            liability.name
        )

        liability.liability_type = validated_data.get(
            "liability_type",
            liability.liability_type
        )

        liability.interest_rate = validated_data.get(
            "interest_rate",
            liability.interest_rate
        )

        liability.tenure_months = validated_data.get(
            "tenure_months",
            liability.tenure_months
        )

        liability.start_date = validated_data.get(
            "start_date",
            liability.start_date
        )

        principal = liability.principal_amount
        interest_rate = liability.interest_rate
        tenure_months = liability.tenure_months
        start_date = liability.start_date

        emi = EMIService.calculate_emi(
            principal,
            interest_rate,
            tenure_months
        )

        total_payable = EMIService.calculate_total_payable(
            emi,
            tenure_months
        )

        total_interest = EMIService.calculate_total_interest(
            total_payable,
            principal
        )

        end_date = EMIService.calculate_end_date(
            start_date,
            tenure_months
        )

        remaining_months = EMIService.calculate_remaining_months(
            start_date,
            tenure_months
        )

        liability.emi_amount = emi
        liability.total_payable = total_payable
        liability.total_interest = total_interest
        liability.end_date = end_date
        liability.remaining_months = remaining_months

        liability.save()

        return liability


    # -----------------------------------------
    # DELETE LIABILITY (SOFT DELETE)
    # -----------------------------------------

    @staticmethod
    def soft_delete_liability(liability):

        liability.is_active = False
        liability.save()

        return liability


    # -----------------------------------------
    # GET USER LIABILITIES
    # -----------------------------------------

    @staticmethod
    def get_user_liabilities(user):

        return Liability.objects.filter(
            user=user,
            is_active=True
        ).order_by("end_date")


    # -----------------------------------------
    # TOTAL MONTHLY EMI
    # -----------------------------------------

    @staticmethod
    def get_total_monthly_emi(user):

        result = Liability.objects.filter(
            user=user,
            is_active=True
        ).aggregate(total=Sum("emi_amount"))

        return result["total"] or Decimal("0.00")


    # -----------------------------------------
    # TOTAL LIABILITY
    # -----------------------------------------

    @staticmethod
    def get_total_remaining_liability(user):

        result = Liability.objects.filter(
            user=user,
            is_active=True
        ).aggregate(total=Sum("remaining_principal"))

        return result["total"] or Decimal("0.00")


    # -----------------------------------------
    # LIABILITY SUMMARY
    # -----------------------------------------

    @staticmethod
    def get_liability_summary(user):

        liabilities = Liability.objects.filter(
            user=user,
            is_active=True
        )

        total_liability = Decimal("0.00")
        total_emi = Decimal("0.00")

        summary = []

        for liability in liabilities:

            total_liability += liability.remaining_principal
            total_emi += liability.emi_amount

            progress = (
                (liability.principal_amount -
                 liability.remaining_principal)
                / liability.principal_amount
            ) * 100

            summary.append({

                "id": liability.id,
                "name": liability.name,
                "principal_amount": liability.principal_amount,
                "remaining_principal": liability.remaining_principal,
                "emi_amount": liability.emi_amount,
                "interest_rate": liability.interest_rate,
                "total_interest": liability.total_interest,
                "total_payable": liability.total_payable,
                "start_date": liability.start_date,
                "end_date": liability.end_date,
                "remaining_months": liability.remaining_months,
                "progress_percentage": round(progress, 2),

            })

        return {

            "total_liability": total_liability,
            "total_monthly_emi": total_emi,
            "liabilities": summary
        }
