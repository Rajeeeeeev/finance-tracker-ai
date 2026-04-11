from django.db.models.signals import post_save
from django.dispatch import receiver
from expenses.models import Expense
from credit_cards.models import CreditCard
from .credit_card_service import create_credit_card_bill_reminder


@receiver(post_save, sender=Expense)
def auto_create_cc_bill_reminder(sender, instance, created, **kwargs):
    """
    When an expense is created on a credit card,
    automatically create a bill reminder if it doesn't exist.
    """
    if not created:
        return  # Only on creation, not on update

    # Ignore bill payment expenses (e.g. paying a credit card bill)
    # This prevents the signal from firing when MarkReminderPaidView
    # creates an Expense with source="BILL"
    if instance.source == "BILL":
        return

    # Only process expenses that are actually linked to a credit card
    if not instance.credit_card:
        return

    # Auto-create bill reminder for this card's current cycle
    try:
        reminder = create_credit_card_bill_reminder(instance.credit_card)
        if reminder:
            print(f"✅ Bill reminder created/found for {instance.credit_card.card_name}")
    except Exception as e:
        print(f"⚠️ Error creating bill reminder: {e}")