from rest_framework.decorators import api_view
from rest_framework.response import Response
from .services import get_stale_investment_updates


@api_view(["GET"])
def investment_update_reminders(request):

    user_id = request.GET.get("user")

    reminders = get_stale_investment_updates(user_id)

    return Response({
        "reminders": reminders
    })

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Investment
from .serializers import InvestmentSerializer

from .services import (
    get_user_investments,
    get_investment_by_id,
    get_investment_summary,
    get_stale_investment_updates
)


# CREATE INVESTMENT
@api_view(["POST"])
def add_investment(request):

    serializer = InvestmentSerializer(data=request.data)

    if serializer.is_valid():

        serializer.save()

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


# GET ALL INVESTMENTS
@api_view(["GET"])
def get_investments(request):

    user_id = request.GET.get("user")

    investments = get_user_investments(user_id)

    serializer = InvestmentSerializer(
        investments,
        many=True
    )

    return Response(serializer.data)


# UPDATE INVESTMENT
@api_view(["PUT"])
def update_investment(request, pk):

    investment = get_investment_by_id(pk)

    if not investment:

        return Response(
            {"error": "Investment not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = InvestmentSerializer(
        investment,
        data=request.data,
        partial=True
    )

    if serializer.is_valid():

        serializer.save()

        return Response(serializer.data)

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


# DELETE INVESTMENT (SOFT DELETE)
@api_view(["DELETE"])
def delete_investment(request, pk):

    investment = Investment.objects.filter(
        id=pk,
        is_active=True
    ).first()

    if not investment:

        return Response(
            {"error": "Investment not found"},
            status=404
        )

    investment.is_active = False
    investment.save()

    return Response(
        {"message": "Investment deleted successfully"}
    )



# INVESTMENT SUMMARY
@api_view(["GET"])
def investment_summary(request):

    user_id = request.GET.get("user")

    summary = get_investment_summary(user_id)

    return Response(summary)


# REMINDER API (already created)
@api_view(["GET"])
def investment_update_reminders(request):

    user_id = request.GET.get("user")

    reminders = get_stale_investment_updates(user_id)

    return Response({
        "reminders": reminders
    })
