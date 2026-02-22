from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Investment
from .serializers import InvestmentSerializer

from .services import (
    get_user_investments,
    get_investment_by_id,
    get_investment_summary,
    get_stale_investment_updates,
)


# CREATE INVESTMENT
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_investment(request):
    """
    Create a new investment for the authenticated user.
    The user field is set automatically from request.user — it cannot
    be overridden by the request body.
    """
    serializer = InvestmentSerializer(data=request.data)

    if serializer.is_valid():

        # Force the user to be the authenticated user — never trust the request body
        serializer.save(user=request.user)

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
@permission_classes([IsAuthenticated])
def get_investments(request):
    """
    Return all active investments belonging to the authenticated user.
    """
    investments = get_user_investments(request.user.id)

    serializer = InvestmentSerializer(investments, many=True)

    return Response(serializer.data)


# UPDATE INVESTMENT
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_investment(request, pk):
    """
    Update an investment by pk. Only the owner can update their own investment.
    Partial update is supported — only send the fields you want to change.
    """
    # Ownership check — filter by both pk AND the authenticated user
    investment = Investment.objects.filter(
        pk=pk,
        user=request.user,
        is_active=True
    ).first()

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
@permission_classes([IsAuthenticated])
def delete_investment(request, pk):
    """
    Soft-delete an investment by setting is_active=False.
    Only the owner can delete their own investment.
    The record is preserved in the database for auditing purposes.
    """
    # Ownership check — filter by pk, active status, AND authenticated user
    investment = Investment.objects.filter(
        id=pk,
        is_active=True,
        user=request.user
    ).first()

    if not investment:
        return Response(
            {"error": "Investment not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    investment.is_active = False
    investment.save()

    return Response(
        {"message": "Investment deleted successfully"},
        status=status.HTTP_200_OK
    )


# INVESTMENT SUMMARY
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def investment_summary(request):
    """
    Return an aggregated summary of all investments for the authenticated user
    (total invested, total current value, overall profit/loss, etc.).
    """
    summary = get_investment_summary(request.user.id)

    return Response(summary)


# STALE UPDATE REMINDERS
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def investment_update_reminders(request):
    """
    Return a list of investments that haven't had their current value
    updated recently, reminding the user to refresh their numbers.
    """
    reminders = get_stale_investment_updates(request.user.id)

    return Response({"reminders": reminders})