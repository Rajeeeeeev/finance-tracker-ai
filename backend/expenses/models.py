from django.db import models
from django.conf import settings
from users.models import User


# ==============================
# EXPENSE MODEL
# ==============================

class Expense(models.Model):

    CATEGORY_CHOICES = [
        ('Food', 'Food'),
        ('Travel', 'Travel'),
        ('Shopping', 'Shopping'),
        ('Bills', 'Bills'),
        ('Entertainment', 'Entertainment'),
        ('Health', 'Health'),
        ('Education', 'Education'),
        ('Groceries', 'Groceries'),
        ('Rent', 'Rent'),
        ('Utilities', 'Utilities'),
        ('Other', 'Other'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('Cash', 'Cash'),
        ('UPI', 'UPI'),
        ('Bank Transfer', 'Bank Transfer'),
        ('Credit Card', 'Credit Card'),
        ('Debit Card', 'Debit Card'),
        ('Wallet', 'Wallet'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    amount = models.DecimalField(max_digits=10, decimal_places=2)

    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES
    )

    payment_method = models.CharField(
        max_length=50,
        choices=PAYMENT_METHOD_CHOICES,
        default='Cash'
    )

    description = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    date = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.amount} - {self.category}"


# ==============================
# BILL REMINDER CHOICES
# ==============================

class ReminderType(models.TextChoices):
    ONE_TIME = "ONE_TIME", "One Time"
    RECURRING = "RECURRING", "Recurring"


class ReminderFrequency(models.TextChoices):
    DAILY = "DAILY", "Daily"
    WEEKLY = "WEEKLY", "Weekly"
    MONTHLY = "MONTHLY", "Monthly"
    YEARLY = "YEARLY", "Yearly"


# ==============================
# BILL REMINDER MODEL
# ==============================

class BillReminder(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bill_reminders"
    )

    title = models.CharField(max_length=255)

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

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

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "bill_reminders"
        ordering = ["due_date"]

    def __str__(self):
        return f"{self.title} - {self.user.username}"
  
  # ==============================
# BUDGET MODEL
# ==============================  
class Budget(models.Model):

    CATEGORY_CHOICES = [
        ('Food', 'Food'),
        ('Travel', 'Travel'),
        ('Shopping', 'Shopping'),
        ('Bills', 'Bills'),
        ('Entertainment', 'Entertainment'),
        ('Health', 'Health'),
        ('Education', 'Education'),
        ('Groceries', 'Groceries'),
        ('Rent', 'Rent'),
        ('Utilities', 'Utilities'),
        ('Other', 'Other'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="budgets"
    )

    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES
    )

    monthly_limit = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "budgets"
        unique_together = ("user", "category")

    def __str__(self):
        return f"{self.user.username} - {self.category} - {self.monthly_limit}"
