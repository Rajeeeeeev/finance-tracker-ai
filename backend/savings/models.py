from django.db import models
from django.conf import settings
from decimal import Decimal
from django.utils import timezone


User = settings.AUTH_USER_MODEL


class SavingsGoal(models.Model):

    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        COMPLETED = "COMPLETED", "Completed"
        PAUSED = "PAUSED", "Paused"
        CANCELLED = "CANCELLED", "Cancelled"

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="savings_goals",
        db_index=True
    )

    name = models.CharField(max_length=255)

    target_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    start_date = models.DateField()
    end_date = models.DateField(db_index=True)

    is_active = models.BooleanField(default=True, db_index=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
        db_index=True
    )

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "savings_goals"
        indexes = [
            models.Index(fields=["user", "is_active"]),
            models.Index(fields=["user", "status"]),
        ]

    def __str__(self):
        return f"{self.name} - {self.user}"
    

class SavingsEntry(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="savings_entries",
        db_index=True
    )

    goal = models.ForeignKey(
        SavingsGoal,
        on_delete=models.CASCADE,
        related_name="entries",
        db_index=True
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    date = models.DateField(default=timezone.now, db_index=True)

    is_active = models.BooleanField(default=True, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = "savings_entries"
        indexes = [
            models.Index(fields=["user", "goal"]),
            models.Index(fields=["goal", "date"]),
        ]

    def __str__(self):
        return f"{self.goal.name} - {self.amount}"
