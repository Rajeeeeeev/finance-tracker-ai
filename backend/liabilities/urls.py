from django.urls import path

from liabilities.views.liability_views import (
    LiabilityCreateAPIView,
    LiabilityListAPIView,
    LiabilityUpdateAPIView,
    LiabilityDeleteAPIView,
)

from liabilities.views.liability_summary_views import (
    LiabilitySummaryAPIView,
)
from liabilities.views.liability_payment_views import LiabilityPaymentCreateAPIView


urlpatterns = [

    path(
        "create/",
        LiabilityCreateAPIView.as_view()
    ),

    path(
        "",
        LiabilityListAPIView.as_view()
    ),

    path(
        "update/<int:liability_id>/",
        LiabilityUpdateAPIView.as_view()
    ),

    path(
        "delete/<int:liability_id>/",
        LiabilityDeleteAPIView.as_view()
    ),

    path(
        "summary/",
        LiabilitySummaryAPIView.as_view()
    ),
    path(
    "pay/<int:liability_id>/",
    LiabilityPaymentCreateAPIView.as_view()
),

]
