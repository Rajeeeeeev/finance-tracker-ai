from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .services import get_financial_summary
from .serializers import FinancialSummarySerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def financial_summary(request):

    period = request.GET.get("period", "monthly")

    if period not in ("monthly", "all"):
        return Response(
            {"error": "Invalid period. Use 'monthly' or 'all'."},
            status=400
        )

    summary = get_financial_summary(
        user_id=request.user.id,
        period=period
    )

    serializer = FinancialSummarySerializer(summary)

    return Response(serializer.data)