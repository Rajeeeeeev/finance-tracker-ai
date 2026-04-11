from django.db.models.signals import pre_save
from django.dispatch import receiver
from .models import Investment, InvestmentLog


@receiver(pre_save, sender=Investment)
def log_investment_changes(sender, instance, **kwargs):
    """
    Before saving an Investment, compare old vs new values for
    invested_amount and current_amount. Create an InvestmentLog
    entry for each field that changed.
    """
    if not instance.pk:
        # New investment — no log needed
        return

    try:
        old = Investment.objects.get(pk=instance.pk)
    except Investment.DoesNotExist:
        return

    # Check invested_amount change
    if old.invested_amount != instance.invested_amount:
        InvestmentLog.objects.create(
            investment=old,
            field_changed="invested",
            old_value=old.invested_amount,
            new_value=instance.invested_amount,
            delta=instance.invested_amount - old.invested_amount,
        )

    # Check current_amount change
    if old.current_amount != instance.current_amount:
        InvestmentLog.objects.create(
            investment=old,
            field_changed="current",
            old_value=old.current_amount,
            new_value=instance.current_amount,
            delta=instance.current_amount - old.current_amount,
        )