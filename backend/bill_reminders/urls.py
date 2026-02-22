from django.urls import path

from .views import (
    AddBillReminderView,
    ReminderListView,
    MarkReminderPaidView,
    OverdueReminderView,
    UpdateBillReminderView,
)

urlpatterns = [

    path(
        "add/",
        AddBillReminderView.as_view(),
        name="add-reminder"
    ),

    path(
        "list/",
        ReminderListView.as_view(),
        name="reminder-list"
    ),

    path(
        "mark-paid/<int:reminder_id>/",
        MarkReminderPaidView.as_view(),
        name="mark-reminder-paid"
    ),

    path(
        "update/<int:reminder_id>/",
        UpdateBillReminderView.as_view(),
        name="update-reminder"
    ),

    path(
        "overdue/",
        OverdueReminderView.as_view(),
        name="overdue-reminders"
    ),

]