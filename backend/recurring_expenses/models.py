from django.db import models
from django.conf import settings
from expenses.models import Expense


class RecurringExpense(models.Model):

    FREQUENCY_CHOICES = [
        ("DAILY", "Daily"),
        ("WEEKLY", "Weekly"),
        ("MONTHLY", "Monthly"),
        ("YEARLY", "Yearly"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="recurring_expenses"
    )

    title = models.CharField(max_length=255)

    amount = models.DecimalField(max_digits=10, decimal_places=2)

    category = models.CharField(
        max_length=50,
        choices=Expense.CATEGORY_CHOICES
    )

    payment_method = models.CharField(
        max_length=50,
        choices=Expense.PAYMENT_METHOD_CHOICES,
        default="Bank Transfer"
    )

    frequency = models.CharField(
        max_length=20,
        choices=FREQUENCY_CHOICES,
        default="MONTHLY"
    )

    start_date = models.DateField()

    last_generated_date = models.DateField(null=True, blank=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "recurring_expenses"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} - {self.amount} - {self.user.username}"
    
    def save(self, *args, **kwargs):
        if not self.user_id:
            raise ValueError("RecurringExpense must have a user")
        super().save(*args, **kwargs)