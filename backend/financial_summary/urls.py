from django.urls import path
from . import views
from .views import FinancialSummaryView

urlpatterns = [
    path("", FinancialSummaryView.as_view(), name="financial-summary"),
]