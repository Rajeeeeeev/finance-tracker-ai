from rest_framework.decorators import APIView, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .services import get_financial_summary
from .serializers import FinancialSummarySerializer

from .services import get_financial_summary, get_date_filter


class FinancialSummaryView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        user_id = request.user.id

        start_date = request.data.get("start_date")
        end_date = request.data.get("end_date")

        year = request.data.get("year")
        month = request.data.get("month")

        start, end = get_date_filter(
            start_date=start_date,
            end_date=end_date,
            year=year,
            month=month
        )

        summary = get_financial_summary(
            user_id=user_id,
            start_date=start,
            end_date=end
        )

        return Response(summary)