from django.urls import path
from .views import (
    AddIncomeView,
    IncomeSummaryView,
    IncomeListView,
    UpdateIncomeView,
    DeleteIncomeView
)

urlpatterns = [

    path('add-income/', AddIncomeView.as_view()),

    path('income-summary/', IncomeSummaryView.as_view()),

    path('income-list/', IncomeListView.as_view()),

    path('update-income/<uuid:id>/', UpdateIncomeView.as_view()),

    path('delete-income/<uuid:id>/', DeleteIncomeView.as_view()),

]
