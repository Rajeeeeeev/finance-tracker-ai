from datetime import date
from .models import RecurringExpense, Expense


def generate_recurring_expenses():

    today = date.today()

    recurring_expenses = RecurringExpense.objects.filter(
        is_active=True
    )

    for recurring in recurring_expenses:

        last = recurring.last_generated_date

        should_generate = False

        if last is None:
            should_generate = True

        elif recurring.frequency == "MONTHLY":
            if today.month != last.month or today.year != last.year:
                should_generate = True

        elif recurring.frequency == "YEARLY":
            if today.year != last.year:
                should_generate = True

        elif recurring.frequency == "WEEKLY":
            if (today - last).days >= 7:
                should_generate = True

        elif recurring.frequency == "DAILY":
            if today != last:
                should_generate = True


        if should_generate:

            Expense.objects.create(
                user=recurring.user,
                amount=recurring.amount,
                category=recurring.category,
                payment_method=recurring.payment_method,
                description=f"{recurring.title} (Recurring)",
                date=today,
                recurring_expense=recurring
            )

            recurring.last_generated_date = today
            recurring.save()

def convert_bill_to_expense(bill_reminder):

    if bill_reminder.is_paid and not bill_reminder.expense_created:

        Expense.objects.create(
            user=bill_reminder.user,
            amount=bill_reminder.amount,
            category="Bills",
            payment_method="Bank Transfer",
            description=bill_reminder.title,
            date=bill_reminder.due_date
        )

        bill_reminder.expense_created = True
        bill_reminder.save()