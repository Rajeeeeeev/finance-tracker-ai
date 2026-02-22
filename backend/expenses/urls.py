from django.urls import path

from .views import (
    AddExpenseView,
    ExpenseListView,
    DeleteExpenseView,
    UpdateExpenseView,
    DashboardView,
    MonthlyExpenseSummaryView,
)

urlpatterns = [

    path(
        "add/",
        AddExpenseView.as_view(),
        name="add-expense"
    ),

    path(
        "list/",
        ExpenseListView.as_view(),
        name="expense-list"
    ),

    path(
        "delete/<int:expense_id>/",
        DeleteExpenseView.as_view(),
        name="delete-expense"
    ),

    path(
        "update/<int:expense_id>/",
        UpdateExpenseView.as_view(),
        name="update-expense"
    ),

    path(
        "dashboard/",
        DashboardView.as_view(),
        name="expense-dashboard"
    ),

    path(
        "monthly-summary/",
        MonthlyExpenseSummaryView.as_view(),
        name="monthly-expense-summary"
    ),

]