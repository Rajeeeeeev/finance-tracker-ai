from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from .models import BillReminder


def calculate_next_due_date(current_due_date, frequency):
    """
    Calculate next due date based on frequency
    """
    if frequency == 'ONCE':
        return None
    elif frequency == 'MONTHLY':
        # Add same day next month
        if current_due_date.month == 12:
            return current_due_date.replace(year=current_due_date.year + 1, month=1)
        else:
            return current_due_date.replace(month=current_due_date.month + 1)
    elif frequency == 'QUARTERLY':
        # Add 3 months
        month = current_due_date.month + 3
        year = current_due_date.year
        if month > 12:
            month -= 12
            year += 1
        return current_due_date.replace(year=year, month=month)
    elif frequency == 'SEMI_ANNUAL':
        # Add 6 months
        month = current_due_date.month + 6
        year = current_due_date.year
        if month > 12:
            month -= 12
            year += 1
        return current_due_date.replace(year=year, month=month)
    elif frequency == 'ANNUAL':
        # Add 1 year
        return current_due_date.replace(year=current_due_date.year + 1)
    
    return None


def generate_next_recurring_reminder(reminder):
    """
    Auto-create next reminder for a recurring bill when marked as paid
    """
    if not reminder.is_recurring:
        return None
    
    # Check if we should create next reminder
    if reminder.recurring_until_date:
        # Don't create if past the end date
        if date.today() > reminder.recurring_until_date:
            return None
    
    # Calculate next due date
    next_due_date = calculate_next_due_date(reminder.due_date, reminder.frequency)
    
    if not next_due_date:
        return None
    
    # Check if reminder for next due date already exists
    existing = BillReminder.objects.filter(
        user=reminder.user,
        bill_name=reminder.bill_name,
        due_date=next_due_date,
        is_paid=False
    ).first()
    
    if existing:
        return existing
    
    # Create new reminder
    next_reminder = BillReminder.objects.create(
        user=reminder.user,
        bill_name=reminder.bill_name,
        category=reminder.category,
        amount=reminder.amount,
        due_date=next_due_date,
        is_recurring=reminder.is_recurring,
        frequency=reminder.frequency,
        recurring_until_date=reminder.recurring_until_date,
        notes=reminder.notes,
        related_credit_card=reminder.related_credit_card,
        parent_reminder=reminder
    )
    
    return next_reminder