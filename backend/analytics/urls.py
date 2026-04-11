from django.urls import path
from .views import (
    MonthlyTrendView,
    CategoryBreakdownView,
    YearOverYearView,
)

urlpatterns = [
    path("monthly-trend/", MonthlyTrendView.as_view()),
    path("category-breakdown/", CategoryBreakdownView.as_view()),
    path("year-over-year/", YearOverYearView.as_view()),
]