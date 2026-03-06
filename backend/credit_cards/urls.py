from django.urls import path
from .views import (
    CreditCardListCreateView,
    CreditCardDetailView,
    CreditCardExpensesView,
    AllCardsSummaryView,
)

urlpatterns = [
    path('',                   CreditCardListCreateView.as_view()),
    path('<int:pk>/',          CreditCardDetailView.as_view()),
    path('<int:pk>/expenses/', CreditCardExpensesView.as_view()),
    path('summary/',           AllCardsSummaryView.as_view()),
]