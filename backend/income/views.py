from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone

from django.db.models import Sum
from django.utils.dateparse import parse_date

from .models import Income
from .serializers import IncomeSerializer

class IncomeSummaryView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user
        now = timezone.now()

        current_month = now.month
        current_year = now.year

        # Total income
        total_income = Income.objects.filter(
            user=user
        ).aggregate(
            total=Sum("amount")
        )["total"] or 0

        # Current month income
        current_month_income = Income.objects.filter(
            user=user,
            date__month=current_month,
            date__year=current_year
        ).aggregate(
            total=Sum("amount")
        )["total"] or 0

        # Last month calculation
        if current_month == 1:
            last_month = 12
            last_year = current_year - 1
        else:
            last_month = current_month - 1
            last_year = current_year

        last_month_income = Income.objects.filter(
            user=user,
            date__month=last_month,
            date__year=last_year
        ).aggregate(
            total=Sum("amount")
        )["total"] or 0

        return Response({

            "total_income": total_income,
            "current_month_income": current_month_income,
            "last_month_income": last_month_income,

        })
class AddIncomeView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = IncomeSerializer(
            data=request.data,
            context={"request": request}
        )

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


# LIST + FILTER + TOTAL
class IncomeListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        incomes = Income.objects.filter(
            user=request.user
        )

        start_date = request.GET.get("start_date")
        end_date = request.GET.get("end_date")

        if start_date:
            incomes = incomes.filter(
                date__gte=parse_date(start_date)
            )

        if end_date:
            incomes = incomes.filter(
                date__lte=parse_date(end_date)
            )

        total_income = incomes.aggregate(
            total=Sum("amount")
        )["total"] or 0

        serializer = IncomeSerializer(incomes, many=True)

        return Response({

            "total_income": total_income,
            "count": incomes.count(),
            "data": serializer.data

        })


# UPDATE income
class UpdateIncomeView(APIView):

    permission_classes = [IsAuthenticated]

    def put(self, request, id):

        try:
            income = Income.objects.get(
                id=id,
                user=request.user
            )
        except Income.DoesNotExist:
            return Response(
                {"error": "Income not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = IncomeSerializer(
            income,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Income updated successfully",
                "data": serializer.data
            })

        return Response(serializer.errors)

# DELETE income
class DeleteIncomeView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request, id):

        try:
            income = Income.objects.get(
                id=id,
                user=request.user
            )
        except Income.DoesNotExist:
            return Response(
                {"error": "Income not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        income.delete()

        return Response({
            "message": "Income deleted successfully"
        })
