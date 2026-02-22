from django.urls import path
from . import views

urlpatterns = [

    # LIST all investments (GET) + CREATE a new one (POST)
    path(
        "investments/",
        views.get_investments,        # GET
        name="investments-list"
    ),
    path(
        "investments/add/",
        views.add_investment,         # POST
        name="investments-add"
    ),

    # SUMMARY — must come before <int:pk> to avoid conflict
    path(
        "investments/summary/",
        views.investment_summary,     # GET
        name="investments-summary"
    ),

    # REMINDERS — must come before <int:pk> to avoid conflict
    path(
        "investments/reminders/",
        views.investment_update_reminders,  # GET
        name="investments-reminders"
    ),

    # UPDATE a specific investment (PUT)
    path(
        "investments/<int:pk>/update/",
        views.update_investment,      # PUT
        name="investments-update"
    ),

    # DELETE a specific investment (DELETE)
    path(
        "investments/<int:pk>/delete/",
        views.delete_investment,      # DELETE
        name="investments-delete"
    ),

]