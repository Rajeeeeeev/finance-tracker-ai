from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from liabilities.services.liability_service import LiabilityService


class LiabilitySummaryAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        summary = LiabilityService.get_liability_summary(
            request.user
        )

        return Response(summary)
