from django.db import models
from django.conf import settings
from decimal import Decimal
from django.utils import timezone

User = settings.AUTH_USER_MODEL


class InvestmentType(models.TextChoices):

    EQUITY = "EQUITY", "Equity"
    COMMODITY = "COMMODITY", "Commodity"
    BOND = "BOND", "Bond"
    DEPOSIT = "DEPOSIT", "Deposit"
    OTHER = "OTHER", "Other"


class Investment(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="investments"
    )

    investment_type = models.CharField(
        max_length=20,
        choices=InvestmentType.choices
    )

    name = models.CharField(
        max_length=255
    )

    symbol = models.CharField(
        max_length=20,
        null=True,
        blank=True
    )

    invested_amount = models.DecimalField(
        max_digits=14,
        decimal_places=2
    )

    invested_amount_updated_at = models.DateTimeField(
        default=timezone.now
    )

    current_amount = models.DecimalField(
        max_digits=14,
        decimal_places=2
    )

    current_amount_updated_at = models.DateTimeField(
        default=timezone.now
    )

    profit_loss = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        blank=True,
        null=True
    )

    profit_loss_percentage = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        blank=True,
        null=True
    )

    is_active = models.BooleanField(
        default=True
    )

    notes = models.TextField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:

        db_table = "investments"

        ordering = ["-created_at"]

        indexes = [
            models.Index(fields=["user"]),
            models.Index(fields=["investment_type"]),
            models.Index(fields=["is_active"]),
        ]

    def calculate_profit_loss(self):

        if self.invested_amount is None or self.current_amount is None:
            return

        self.profit_loss = self.current_amount - self.invested_amount

        if self.invested_amount > Decimal("0"):
            self.profit_loss_percentage = (
                (self.profit_loss / self.invested_amount) * Decimal("100")
            )
        else:
            self.profit_loss_percentage = Decimal("0")

    def save(self, *args, **kwargs):

        # detect invested amount change
        if self.pk:
            old = Investment.objects.get(pk=self.pk)

            if old.invested_amount != self.invested_amount:
                self.invested_amount_updated_at = timezone.now()

            if old.current_amount != self.current_amount:
                self.current_amount_updated_at = timezone.now()

        # calculate profit/loss
        self.calculate_profit_loss()

        super().save(*args, **kwargs)

    def __str__(self):

        return f"{self.name} ({self.investment_type})"
