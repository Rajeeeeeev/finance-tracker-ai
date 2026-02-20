from datetime import datetime

from django.db.models import Sum

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Income, IncomeType
from .serializers import IncomeSerializer


class IncomeSummaryView(APIView):

    def get(self, request):

        user_id = request.GET.get("user")

        month = request.GET.get("month")
        year = request.GET.get("year")

        # default to current month/year
        if not month or not year:

            today = datetime.today()
            month = today.month
            year = today.year

        incomes = Income.objects.filter(
            user=user_id,
            date__month=month,
            date__year=year
        )

        total_income = incomes.aggregate(
            total=Sum("amount")
        )["total"] or 0

        income_by_type = {}

        # Use IncomeType properly
        for income_type in IncomeType.choices:

            key = income_type[0]

            type_total = incomes.filter(
                income_type=key
            ).aggregate(
                total=Sum("amount")
            )["total"] or 0

            income_by_type[key] = float(type_total)

        return Response({

            "month": int(month),
            "year": int(year),

            "total_income": float(total_income),

            "income_by_type": income_by_type

        })


class AddIncomeView(APIView):

    def post(self, request):

        serializer = IncomeSerializer(data=request.data)

        if serializer.is_valid():

            serializer.save()

            return Response(
                {
                    "message": "Income added successfully",
                    "data": serializer.data
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
