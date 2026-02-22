from django.db import models
from django.conf import settings


class ReminderType(models.TextChoices):
    ONE_TIME = "ONE_TIME", "One Time"
    RECURRING = "RECURRING", "Recurring"


class ReminderFrequency(models.TextChoices):
    DAILY = "DAILY", "Daily"
    WEEKLY = "WEEKLY", "Weekly"
    MONTHLY = "MONTHLY", "Monthly"
    YEARLY = "YEARLY", "Yearly"


class BillReminder(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bill_reminders"
    )

    title = models.CharField(max_length=255)

    amount = models.DecimalField(max_digits=10, decimal_places=2)

    due_date = models.DateField()

    reminder_type = models.CharField(
        max_length=20,
        choices=ReminderType.choices,
        default=ReminderType.ONE_TIME
    )

    frequency = models.CharField(
        max_length=20,
        choices=ReminderFrequency.choices,
        null=True,
        blank=True
    )

    is_paid = models.BooleanField(default=False)

    expense_created = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "bill_reminders"
        ordering = ["due_date"]

    def __str__(self):
        return f"{self.title} - {self.user.username}"