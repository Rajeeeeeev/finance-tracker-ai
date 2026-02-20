from decimal import Decimal
from datetime import date

from liabilities.models import Liability, LiabilityPayment
from expenses.models import Expense


class LiabilityPaymentService:


    @staticmethod
    def make_payment(user, liability):

        emi_amount = liability.emi_amount

        # Calculate monthly interest portion
        monthly_interest_rate = liability.interest_rate / Decimal("12") / Decimal("100")

        interest_component = (
            liability.remaining_principal * monthly_interest_rate
        ).quantize(Decimal("0.01"))

        principal_component = (
            emi_amount - interest_component
        ).quantize(Decimal("0.01"))

        # Update remaining principal
        liability.remaining_principal -= principal_component

        liability.remaining_months -= 1

        liability.save()

        # Create payment record
        payment = LiabilityPayment.objects.create(

            user=user,

            liability=liability,

            amount=emi_amount,

            payment_date=date.today(),

            principal_component=principal_component,

            interest_component=interest_component,
        )

        # Create expense entry automatically
        Expense.objects.create(

            user=user,

            amount=emi_amount,

            category="EMI",

            description=f"{liability.name} EMI",

            date=date.today(),
        )

        return payment
