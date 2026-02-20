from decimal import Decimal, getcontext
from datetime import date
from dateutil.relativedelta import relativedelta

getcontext().prec = 28


class EMIService:

    @staticmethod
    def calculate_emi(principal, annual_interest_rate, tenure_months):

        principal = Decimal(principal)
        annual_interest_rate = Decimal(annual_interest_rate)

        monthly_rate = annual_interest_rate / Decimal("12") / Decimal("100")

        if monthly_rate == 0:

            emi = principal / tenure_months

        else:

            emi = (
                principal * monthly_rate *
                (1 + monthly_rate) ** tenure_months
            ) / (
                (1 + monthly_rate) ** tenure_months - 1
            )

        return emi.quantize(Decimal("0.01"))


    @staticmethod
    def calculate_total_payable(emi, tenure_months):

        return (emi * tenure_months).quantize(Decimal("0.01"))


    @staticmethod
    def calculate_total_interest(total_payable, principal):

        return (total_payable - principal).quantize(Decimal("0.01"))


    @staticmethod
    def calculate_end_date(start_date, tenure_months):

        return start_date + relativedelta(months=tenure_months)


    @staticmethod
    def calculate_remaining_months(start_date, tenure_months):

        today = date.today()

        elapsed = relativedelta(today, start_date).months + \
                  relativedelta(today, start_date).years * 12

        remaining = tenure_months - elapsed

        return max(remaining, 0)
