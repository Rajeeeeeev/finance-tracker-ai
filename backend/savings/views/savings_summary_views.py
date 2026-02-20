from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from savings.models import SavingsGoal
from savings.serializers import SavingsGoalSummarySerializer
from savings.services.savings_goal_service import SavingsGoalService


# -----------------------------------------
# SAVINGS SUMMARY API
# -----------------------------------------

class SavingsGoalSummaryAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        goals = SavingsGoal.objects.filter(
            user=request.user,
            is_active=True
        )

        summaries = []

        for goal in goals:

            summary = SavingsGoalService.get_goal_summary(goal)

            summaries.append(summary)

        serializer = SavingsGoalSummarySerializer(
            summaries,
            many=True
        )

        return Response(serializer.data)
