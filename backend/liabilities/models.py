from django.db import models
from django.conf import settings
from decimal import Decimal

User = settings.AUTH_USER_MODEL


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

    emi_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    total_payable = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    total_interest = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    remaining_principal = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    start_date = models.DateField()

    end_date = models.DateField(db_index=True)

    remaining_months = models.IntegerField()

    is_active = models.BooleanField(default=True, db_index=True)

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

    payment_date = models.DateField(db_index=True)

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

    created_at = models.DateTimeField(auto_now_add=True)


    class Meta:

        db_table = "liability_payments"

        indexes = [
            models.Index(fields=["user", "payment_date"]),
            models.Index(fields=["liability", "payment_date"]),
        ]


    def __str__(self):
        return f"{self.liability.name} - {self.amount}"
