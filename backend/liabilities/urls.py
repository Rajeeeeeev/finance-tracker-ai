from django.urls import path

from liabilities.views.liability_views import (
    LiabilityCloseAPIView,
    LiabilityCreateAPIView,
    LiabilityListAPIView,
    LiabilityUpdateAPIView,
    LiabilityDeleteAPIView,
    LiabilityDetailAPIView,
    LiabilityPaymentHistoryAPIView
)

from liabilities.views.liability_summary_views import (
    LiabilitySummaryAPIView,
)
from liabilities.views.liability_payment_views import (
    LiabilityPaymentCreateAPIView,
)
from liabilities.views.liability_views import EMIHistoryView

urlpatterns = [

    path("create/", LiabilityCreateAPIView.as_view()),

    path("list/", LiabilityListAPIView.as_view()),

    path("<int:liability_id>/", LiabilityDetailAPIView.as_view()),

    path("<int:liability_id>/update/", LiabilityUpdateAPIView.as_view()),

    path("<int:liability_id>/delete/", LiabilityDeleteAPIView.as_view()),

    path("<int:liability_id>/pay/", LiabilityPaymentCreateAPIView.as_view()),

    path("<int:liability_id>/payments/", LiabilityPaymentHistoryAPIView.as_view()),

    path("summary/", LiabilitySummaryAPIView.as_view()),

    path(
    "<int:liability_id>/emi-history/",
    EMIHistoryView.as_view(),
    name="emi-history"
),
path(
    "<int:liability_id>/close/",
    LiabilityCloseAPIView.as_view(),
),
]
