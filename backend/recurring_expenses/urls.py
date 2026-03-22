from django.urls import path

from .views import (
    RecurringExpenseListCreateView,
    RecurringExpenseDetailView,
    TriggerRecurringGenerationView,
)

urlpatterns = [

    path(
        "",
        RecurringExpenseListCreateView.as_view(),
        name="recurring-list-create"
    ),

    path(
        "<int:pk>/",
        RecurringExpenseDetailView.as_view(),
        name="recurring-detail"
    ),

    path(
        "trigger-generation/",
        TriggerRecurringGenerationView.as_view(),
        name="recurring-trigger-generation"
    ),

]