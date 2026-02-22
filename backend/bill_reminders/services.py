from expenses.models import Expense


def convert_bill_to_expense(bill_reminder):

    if bill_reminder.is_paid and not bill_reminder.expense_created:

        Expense.objects.create(
            user=bill_reminder.user,
            amount=bill_reminder.amount,
            category="Bills",
            payment_method="Bank Transfer",
            description=bill_reminder.title,
            date=bill_reminder.due_date,
            source="BILL"
        )

        bill_reminder.expense_created = True
        bill_reminder.save()