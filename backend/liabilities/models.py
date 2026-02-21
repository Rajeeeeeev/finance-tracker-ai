from django.db import models
from django.conf import settings
from decimal import Decimal
import math
from datetime import date

User = settings.AUTH_USER_MODEL


# =====================================================
# LIABILITY MODEL (Loan Master Record)
# =====================================================

class Liability(models.Model):

    class LiabilityType(models.TextChoices):

        HOME_LOAN = "HOME_LOAN", "Home Loan"
        CAR_LOAN = "CAR_LOAN", "Car Loan"
        EDUCATION_LOAN = "EDUCATION_LOAN", "Education Loan"
        PERSONAL_LOAN = "PERSONAL_LOAN", "Personal Loan"
        CREDIT_CARD = "CREDIT_CARD", "Credit Card"
        OTHER = "OTHER", "Other"


    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="liabilities",
        db_index=True
    )

    name = models.CharField(max_length=255)

    liability_type = models.CharField(
        max_length=50,
        choices=LiabilityType.choices,
        default=LiabilityType.OTHER,
        db_index=True
    )

    # Loan inputs from user
    principal_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    interest_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Annual interest rate in percentage"
    )

    tenure_months = models.IntegerField()

    start_date = models.DateField()


    # Automatically calculated fields
    emi_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True
    )

    total_payable = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True
    )

    total_interest = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True
    )

    remaining_principal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True
    )

    remaining_months = models.IntegerField(
        blank=True,
        null=True
    )

    end_date = models.DateField(
        blank=True,
        null=True,
        db_index=True
    )

    is_active = models.BooleanField(
        default=True,
        db_index=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)


    class Meta:

        db_table = "liabilities"

        indexes = [
            models.Index(fields=["user", "is_active"]),
            models.Index(fields=["user", "end_date"]),
        ]


    def __str__(self):

        return f"{self.name} - {self.user}"


    # =====================================================
    # EMI CALCULATION
    # =====================================================

    def calculate_emi(self):

        P = float(self.principal_amount)

        r = float(self.interest_rate) / 12 / 100

        n = self.tenure_months

        if r == 0:
            emi = P / n
        else:
            emi = P * r * (1 + r)**n / ((1 + r)**n - 1)

        return Decimal(round(emi, 2))


    # =====================================================
    # AUTO CALCULATE ON SAVE
    # =====================================================

    def save(self, *args, **kwargs):

        is_new = self.pk is None

        if is_new:

            emi = self.calculate_emi()

            total_payable = emi * self.tenure_months

            total_interest = total_payable - self.principal_amount

            self.emi_amount = emi

            self.total_payable = total_payable

            self.total_interest = total_interest

            self.remaining_principal = self.principal_amount

            self.remaining_months = self.tenure_months

            # calculate end date
            months = self.tenure_months
            year = self.start_date.year + months // 12
            month = self.start_date.month + months % 12

            if month > 12:
                year += 1
                month -= 12

            self.end_date = date(year, month, self.start_date.day)

        super().save(*args, **kwargs)


# =====================================================
# LIABILITY PAYMENT MODEL (EMI HISTORY)
# =====================================================

class LiabilityPayment(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="liability_payments",
        db_index=True
    )

    liability = models.ForeignKey(
        Liability,
        on_delete=models.CASCADE,
        related_name="payments",
        db_index=True
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    payment_date = models.DateField(
        db_index=True
    )

    principal_component = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    interest_component = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    expense = models.ForeignKey(
        "expenses.Expense",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="liability_payments"
    )

    created_at = models.DateTimeField(auto_now_add=True)


    class Meta:

        db_table = "liability_payments"

        indexes = [
            models.Index(fields=["user", "payment_date"]),
            models.Index(fields=["liability", "payment_date"]),
        ]


    def __str__(self):

        return f"{self.liability.name} - {self.amount}"


    # =====================================================
    # APPLY PAYMENT LOGIC
    # =====================================================

    def apply_payment(self):

        liability = self.liability

        liability.remaining_principal -= self.principal_component

        liability.remaining_months -= 1

        if liability.remaining_months <= 0:

            liability.is_active = False

            liability.remaining_principal = Decimal("0.00")

        liability.save()