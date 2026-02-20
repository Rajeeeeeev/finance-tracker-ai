from django.urls import path
from .views import AddIncomeView
from .views import IncomeSummaryView


urlpatterns = [

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

]
