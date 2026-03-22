from django.db import models
from django.conf import settings


class BillReminder(models.Model):

    CATEGORY_CHOICES = [
        ('Electricity', 'Electricity'),
        ('Water', 'Water'),
        ('Internet', 'Internet'),
        ('Mobile', 'Mobile'),
        ('Insurance', 'Insurance'),
        ('Rent', 'Rent'),
        ('Subscriptions', 'Subscriptions'),
        ('Maintenance', 'Maintenance'),
        ('Other', 'Other'),
    ]

    FREQUENCY_CHOICES = [
        ('ONCE', 'One Time'),
        ('MONTHLY', 'Monthly'),
        ('QUARTERLY', 'Quarterly'),
        ('SEMI_ANNUAL', 'Semi-Annual'),
        ('ANNUAL', 'Annual'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bill_reminders"
    )

    bill_name = models.CharField(max_length=255)

    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        default='Other'
    )

    amount = models.DecimalField(max_digits=10, decimal_places=2)

    due_date = models.DateField()

    # Recurring support
    is_recurring = models.BooleanField(default=False)

    frequency = models.CharField(
        max_length=20,
        choices=FREQUENCY_CHOICES,
        default='ONCE',
        help_text="How often this bill repeats"
    )

    # For temporary recurring bills: when to stop creating reminders
    recurring_until_date = models.DateField(
        null=True,
        blank=True,
        help_text="Stop creating reminders after this date (for temporary recurring bills)"
    )

    # Track if this was auto-created from a recurring pattern
    parent_reminder = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='child_reminders',
        help_text="Reference to the original recurring reminder"
    )

    is_paid = models.BooleanField(default=False)

    expense_created = models.BooleanField(default=False)

    notes = models.TextField(blank=True, null=True)

    related_credit_card = models.ForeignKey(
        "credit_cards.CreditCard",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="bill_reminders"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "bill_reminders"
        ordering = ["due_date"]
        indexes = [
            models.Index(fields=['user', 'is_paid']),
            models.Index(fields=['user', 'due_date']),
        ]

    def __str__(self):
        return f"{self.bill_name} - {self.amount} - {self.user.username}"

    def save(self, *args, **kwargs):
        if not self.user_id:
            raise ValueError("BillReminder must have a user")
        super().save(*args, **kwargs)

    @property
    def is_overdue(self):
        """Check if bill is overdue"""
        from datetime import date
        return not self.is_paid and self.due_date < date.today()

    @property
    def days_until_due(self):
        """Calculate days until due date"""
        from datetime import date
        if self.is_paid:
            return None
        delta = self.due_date - date.today()
        return delta.days

    @property
    def should_create_next(self):
        """Check if next recurring reminder should be created"""
        if not self.is_recurring or self.is_paid:
            return False
        
        # If there's an end date and we've passed it, don't create more
        if self.recurring_until_date:
            from datetime import date
            if date.today() > self.recurring_until_date:
                return False
        
        return True