from decimal import Decimal
from datetime import date

from liabilities.models import LiabilityPayment
from expenses.models import Expense


class LiabilityPaymentService:


    @staticmethod
    def make_payment(user, liability):

        if not liability.is_active:
            raise Exception("Liability already completed")

        today = date.today()

        # Prevent duplicate EMI payment
        existing_payment = LiabilityPayment.objects.filter(
            liability=liability,
            payment_date__year=today.year,
            payment_date__month=today.month
        ).exists()

        if existing_payment:
            raise Exception("EMI already paid this month")

        emi_amount = liability.emi_amount

        monthly_interest_rate = (
            liability.interest_rate /
            Decimal("12") /
            Decimal("100")
        )

        interest_component = (
            liability.remaining_principal *
            monthly_interest_rate
        ).quantize(Decimal("0.01"))

        principal_component = (
            emi_amount - interest_component
        ).quantize(Decimal("0.01"))

        # Create Expense FIRST
        expense = Expense.objects.create(

            user=user,

            amount=emi_amount,

            category="Bills",

            payment_method="Bank Transfer",

            description=f"{liability.name} EMI",

            date=today,

            source="EMI",

            liability=liability
        )

        # Create EMI payment history
        payment = LiabilityPayment.objects.create(

            user=user,

            liability=liability,

            amount=emi_amount,

            payment_date=today,

            principal_component=principal_component,

            interest_component=interest_component,

            expense=expense
        )

        # Update liability balance
        liability.remaining_principal -= principal_component

        liability.remaining_months -= 1

        if liability.remaining_months <= 0:

            liability.remaining_principal = Decimal("0.00")

            liability.is_active = False

        liability.save()

        return payment