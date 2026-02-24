from django.urls import path
from . import views

urlpatterns = [
    path("", views.financial_summary, name="financial-summary"),
]