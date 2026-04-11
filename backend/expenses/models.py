from django.db import models
from django.conf import settings
from users.models import User


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
        ('Savings', 'Savings'),
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

    SOURCE_CHOICES = [
        ("MANUAL", "Manual"),
        ("EMI", "EMI"),
        ("RECURRING", "Recurring"),
        ("BILL", "Bill"),
        # Credit card purchases: recorded for card tracking but
        # EXCLUDED from all expense totals/aggregates until the
        # bill is paid (at which point a BILL source expense is created).
        ("CREDIT_CARD", "Credit Card Purchase"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    amount = models.DecimalField(max_digits=10, decimal_places=2)

    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)

    payment_method = models.CharField(
        max_length=50,
        choices=PAYMENT_METHOD_CHOICES,
        default='Cash'
    )

    description = models.CharField(max_length=255, blank=True, null=True)

    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    recurring_expense = models.ForeignKey(
        "recurring_expenses.RecurringExpense",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="generated_expenses"
    )

    source = models.CharField(
        max_length=20,
        choices=SOURCE_CHOICES,
        default="MANUAL"
    )

    liability = models.ForeignKey(
        "liabilities.Liability",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="expenses"
    )

    credit_card = models.ForeignKey(
        "credit_cards.CreditCard",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="expenses"
    )

    def __str__(self):
        return f"{self.user.username} - {self.amount} - {self.category}"