from django.urls import path
from .views import (
    AddIncomeView,
    IncomeSummaryView,
    IncomeListView,
    UpdateIncomeView,
    DeleteIncomeView
)
app_name = "income"
urlpatterns = [

    path('add-income/', AddIncomeView.as_view()),

    path('income-summary/', IncomeSummaryView.as_view()),

    path('income-list/', IncomeListView.as_view()),

    path('update-income/<int:id>/', UpdateIncomeView.as_view()),
    path('delete-income/<int:id>/', DeleteIncomeView.as_view()),

]
