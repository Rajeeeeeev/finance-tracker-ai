from django.urls import path

from .views import (
    SetBudgetView,
    BudgetStatusView,
)

urlpatterns = [

    path(
        "set/",
        SetBudgetView.as_view(),
        name="set-budget"
    ),

    path(
        "status/",
        BudgetStatusView.as_view(),
        name="budget-status"
    ),

]