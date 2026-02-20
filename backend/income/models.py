from django.db import models
from django.conf import settings

class IncomeType(models.TextChoices):

    SALARY = "SALARY", "Salary"

    BUSINESS = "BUSINESS", "Business Income"

    INVESTMENT_RETURN = "INVESTMENT_RETURN", "Investment Return"

    RENTAL = "RENTAL", "Rental Income"

    OTHER = "OTHER", "Other"

class Income(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="incomes"
    )

    source_name = models.CharField(
        max_length=255
    )

    income_type = models.CharField(
        max_length=50,
        choices=IncomeType.choices
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    date = models.DateField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:

        db_table = "income"

        ordering = ["-date"]

    def __str__(self):

        return f"{self.user.username} - {self.income_type} - {self.amount}"
