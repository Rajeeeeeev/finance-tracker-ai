from django.urls import path
from .views import (
    AddExpenseView,
    ExpenseListView,
    DeleteExpenseView,
    UpdateExpenseView,
    DashboardView,
)
from .views import AddBillReminderView
from .views import ReminderListView, MarkReminderPaidView
from .views import OverdueReminderView
from .views import GenerateRecurringRemindersView
from .views import SetBudgetView
from .views import BudgetStatusView
from .views import OverspendingAlertView
from .views import (
    RecurringExpenseListCreateView,
    RecurringExpenseDetailView,
    UpdateBillReminderView
)



urlpatterns = [
    path("add-expense/", AddExpenseView.as_view(), name="add-expense"),
    path("expenses/", ExpenseListView.as_view(), name="expenses"),
    path(
        "delete-expense/<int:expense_id>/",
        DeleteExpenseView.as_view(),
        name="delete-expense",
    ),
    path(
        "update-expense/<int:expense_id>/",
        UpdateExpenseView.as_view(),
        name="update-expense",
    ),
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
    path("add-reminder/", AddBillReminderView.as_view(), name="add-reminder"),
    path("reminders/", ReminderListView.as_view(), name="reminders"),
    path(
        "reminder/<int:reminder_id>/mark-paid/",
        MarkReminderPaidView.as_view(),
        name="mark-reminder-paid",
    ),
    path(
    "reminder/<int:reminder_id>/update/",
    UpdateBillReminderView.as_view(),
    name="update-reminder"
),
    path("reminders/overdue/", OverdueReminderView.as_view(), name="overdue-reminders"),
    path(
        "reminders/generate-recurring/",
        GenerateRecurringRemindersView.as_view(),
        name="generate-recurring",
    ),
    path("set-budget/", SetBudgetView.as_view(), name="set-budget"),

    path(
    'budget-status/',
    BudgetStatusView.as_view(),
    name='budget-status'
),
path(
    'budget-alerts/',
    OverspendingAlertView.as_view(),
    name='budget-alerts'
),

    path(
        "recurring/",
        RecurringExpenseListCreateView.as_view()
    ),

    path(
        "recurring/<int:pk>/",
        RecurringExpenseDetailView.as_view()
    ),
]