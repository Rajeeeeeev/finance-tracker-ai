from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from .models import BillReminder
from credit_cards.models import CreditCard
from expenses.models import Expense


def calculate_due_date_from_card(card):
    """
    Calculate the actual due date from credit card billing info
    
    Example: If billing_date=25 and due_date_days=15
    Transaction on March 5 → Due date: April 10 (March 25 + 15 days)
    """
    today = date.today()
    
    # Get current or next billing cycle
    if today.day <= card.billing_date:
        # Billing date hasn't occurred yet this month
        billing_date = date(today.year, today.month, card.billing_date)
    else:
        # Billing date has passed, use next month
        next_month = today + relativedelta(months=1)
        # Handle month-end edge cases
        try:
            billing_date = date(next_month.year, next_month.month, card.billing_date)
        except ValueError:
            # If day doesn't exist (e.g., Feb 30), use last day of month
            billing_date = (date(next_month.year, next_month.month, 1) + relativedelta(months=1)) - timedelta(days=1)
    
    # Add due_date_days to billing date
    due_date = billing_date + timedelta(days=card.due_date_days)
    
    return due_date


def get_credit_card_statement_amount(card, month=None):
    """
    Get total amount spent on credit card in a given month
    """
    if month is None:
        month = date.today()
    
    # Get all expenses for this card in the billing month
    start_date = date(month.year, month.month, 1)
    end_date = (start_date + relativedelta(months=1)) - timedelta(days=1)
    
    expenses = Expense.objects.filter(
        user=card.user,
        credit_card=card,
        date__gte=start_date,
        date__lte=end_date
    )
    
    total = sum(exp.amount for exp in expenses) if expenses else 0
    return total


def create_credit_card_bill_reminder(card, for_month=None):
    """
    Create or update bill reminder for a credit card
    Only creates if card has spending
    """
    if not card.is_active:
        return None
    
    if for_month is None:
        for_month = date.today()
    
    # Check if card has spending this month
    amount = get_credit_card_statement_amount(card, for_month)
    
    if amount == 0:
        # No spending, don't create reminder
        return None
    
    # Calculate due date
    due_date = calculate_due_date_from_card(card)
    
    # Check if reminder already exists for this card and due date
    existing = BillReminder.objects.filter(
        user=card.user,
        related_credit_card=card,
        due_date=due_date,
        is_paid=False
    ).first()
    
    if existing:
        return existing  # Already exists
    
    # Create new bill reminder
    reminder = BillReminder.objects.create(
        user=card.user,
        bill_name=f"{card.card_name} ****{card.last_four_digits} - Statement",
        category='Subscriptions',
        amount=amount,
        due_date=due_date,
        is_recurring=True,
        frequency='MONTHLY',
        recurring_until_date=None,  # Continue until card is closed
        notes=f"Credit card bill for {card.bank_name} {card.card_name}. Billing date: {card.billing_date}",
        related_credit_card=card
    )
    
    return reminder


def get_credit_card_outstanding(card):
    """
    Get total outstanding balance on credit card
    """
    unpaid_reminders = BillReminder.objects.filter(
        related_credit_card=card,
        is_paid=False
    )
    
    total = sum(r.amount for r in unpaid_reminders)
    return total


def get_credit_card_utilization(card):
    """
    Get current credit utilization percentage
    """
    outstanding = get_credit_card_outstanding(card)
    utilization = (outstanding / float(card.credit_limit)) * 100
    return min(utilization, 100.0)