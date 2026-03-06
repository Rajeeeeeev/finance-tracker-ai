from django.db import models
from django.conf import settings


class CreditCard(models.Model):
    CARD_NETWORK_CHOICES = [
        ('Visa', 'Visa'),
        ('Mastercard', 'Mastercard'),
        ('RuPay', 'RuPay'),
        ('Amex', 'American Express'),
        ('Other', 'Other'),
    ]

    user             = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='credit_cards')
    card_name        = models.CharField(max_length=100)
    bank_name        = models.CharField(max_length=100)
    card_network     = models.CharField(max_length=20, choices=CARD_NETWORK_CHOICES, default='Visa')
    last_four_digits = models.CharField(max_length=4)
    credit_limit     = models.DecimalField(max_digits=12, decimal_places=2)
    billing_date     = models.PositiveIntegerField()
    due_date_days    = models.PositiveIntegerField(default=15)
    interest_rate    = models.DecimalField(max_digits=5, decimal_places=2, default=36.00)
    is_active        = models.BooleanField(default=True)
    created_at       = models.DateTimeField(auto_now_add=True)
    updated_at       = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.card_name} ****{self.last_four_digits} ({self.user.username})"

    class Meta:
        ordering = ['-created_at']