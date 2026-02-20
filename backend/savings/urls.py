from django.urls import path

from savings.views.savings_goal_views import (
    SavingsGoalCreateAPIView,
    SavingsGoalListAPIView,
    SavingsGoalUpdateAPIView,
    SavingsGoalDeleteAPIView,
)

from savings.views.savings_entry_views import (
    SavingsEntryCreateAPIView,
    SavingsEntryListAPIView,
    SavingsEntryDeleteAPIView,
)

from savings.views.savings_summary_views import (
    SavingsGoalSummaryAPIView,
)


urlpatterns = [

    # -----------------------------
    # SAVINGS GOAL APIs
    # -----------------------------

    path(
        "goals/create/",
        SavingsGoalCreateAPIView.as_view(),
        name="create-savings-goal",
    ),

    path(
        "goals/",
        SavingsGoalListAPIView.as_view(),
        name="list-savings-goals",
    ),

    path(
        "goals/update/<int:goal_id>/",
        SavingsGoalUpdateAPIView.as_view(),
        name="update-savings-goal",
    ),

    path(
        "goals/delete/<int:goal_id>/",
        SavingsGoalDeleteAPIView.as_view(),
        name="delete-savings-goal",
    ),


    # -----------------------------
    # SAVINGS ENTRY APIs
    # -----------------------------

    path(
        "entries/create/",
        SavingsEntryCreateAPIView.as_view(),
        name="create-savings-entry",
    ),

    path(
        "entries/",
        SavingsEntryListAPIView.as_view(),
        name="list-savings-entries",
    ),

    path(
        "entries/delete/<int:entry_id>/",
        SavingsEntryDeleteAPIView.as_view(),
        name="delete-savings-entry",
    ),


    # -----------------------------
    # SAVINGS SUMMARY API
    # -----------------------------

    path(
        "summary/",
        SavingsGoalSummaryAPIView.as_view(),
        name="savings-summary",
    ),
]
