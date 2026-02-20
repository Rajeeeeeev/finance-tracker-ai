from django.urls import path
from .views import (
    AddIncomeView,
    IncomeSummaryView,
    IncomeListView,
    UpdateIncomeView,
    DeleteIncomeView
)

urlpatterns = [

    # Existing
    path(
        'add-income/',
        AddIncomeView.as_view(),
        name='add-income'
    ),

    path(
        'income-summary/',
        IncomeSummaryView.as_view(),
        name='income-summary'
    ),

    # NEW: list + filter
    path(
        'income-list/',
        IncomeListView.as_view(),
        name='income-list'
    ),

    # NEW: update
    path(
        'update-income/<uuid:id>/',
        UpdateIncomeView.as_view(),
        name='update-income'
    ),

    # NEW: delete
    path(
        'delete-income/<uuid:id>/',
        DeleteIncomeView.as_view(),
        name='delete-income'
    ),

]
