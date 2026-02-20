from django.urls import path
from . import views

urlpatterns = [

    # CREATE
    path(
        "add-investment/",
        views.add_investment,
        name="add-investment"
    ),

    # READ
    path(
        "investments/",
        views.get_investments,
        name="get-investments"
    ),

    # UPDATE
    path(
        "update-investment/<int:pk>/",
        views.update_investment,
        name="update-investment"
    ),

    # DELETE
    path(
        "delete-investment/<int:pk>/",
        views.delete_investment,
        name="delete-investment"
    ),

    # SUMMARY
    path(
        "investment-summary/",
        views.investment_summary,
        name="investment-summary"
    ),

    # REMINDERS
    path(
        "investments/update-reminders/",
        views.investment_update_reminders,
        name="investment-update-reminders"
    ),

]
