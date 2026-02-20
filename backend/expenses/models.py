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

    recurring_expense = models.ForeignKey(
        "RecurringExpense",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="generated_expenses"
    )

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
    expense_created = models.BooleanField(default=False)
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

# ==============================
# RECURRING EXPENSE MODEL
# ==============================

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

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

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

    last_generated_date = models.DateField(
        null=True,
        blank=True
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)


    class Meta:
        db_table = "recurring_expenses"
        ordering = ["-created_at"]


    def __str__(self):
        return f"{self.title} - {self.amount} - {self.user.username}"
