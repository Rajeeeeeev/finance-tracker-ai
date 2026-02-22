from datetime import date
from django.db import transaction

from recurring_expenses.models import RecurringExpense
from expenses.models import Expense


def generate_recurring_expenses():

    today = date.today()

    recurring_expenses = RecurringExpense.objects.filter(
        is_active=True,
        user__isnull=False   # PROTECTION
    )

    for recurring in recurring_expenses:

        # Extra safety check
        if not recurring.user:
            continue

        last = recurring.last_generated_date

        should_generate = False

        if last is None:
            should_generate = True

        elif recurring.frequency == "MONTHLY":
            should_generate = (
                today.year != last.year or today.month != last.month
            )

        elif recurring.frequency == "YEARLY":
            should_generate = today.year != last.year

        elif recurring.frequency == "WEEKLY":
            should_generate = (today - last).days >= 7

        elif recurring.frequency == "DAILY":
            should_generate = today != last

        if should_generate:

            with transaction.atomic():

                Expense.objects.create(
                    user=recurring.user,
                    amount=recurring.amount,
                    category=recurring.category,
                    payment_method=recurring.payment_method,
                    description=f"{recurring.title} (Recurring)",
                    date=today,
                    recurring_expense=recurring,
                    source="RECURRING"
                )

                recurring.last_generated_date = today
                recurring.save(update_fields=["last_generated_date"])