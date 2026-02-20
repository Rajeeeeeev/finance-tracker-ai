from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from savings.models import SavingsGoal
from savings.serializers import SavingsGoalSerializer
from savings.services.savings_goal_service import SavingsGoalService


# -----------------------------------------
# CREATE SAVINGS GOAL
# -----------------------------------------

class SavingsGoalCreateAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = SavingsGoalSerializer(data=request.data)

        if serializer.is_valid():

            goal = SavingsGoalService.create_goal(
                user=request.user,
                validated_data=serializer.validated_data
            )

            return Response(
                SavingsGoalSerializer(goal).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# -----------------------------------------
# LIST SAVINGS GOALS
# -----------------------------------------

class SavingsGoalListAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        goals = SavingsGoal.objects.filter(
            user=request.user,
            is_active=True
        ).order_by("-created_at")

        serializer = SavingsGoalSerializer(goals, many=True)

        return Response(serializer.data)


# -----------------------------------------
# UPDATE SAVINGS GOAL
# -----------------------------------------

class SavingsGoalUpdateAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def put(self, request, goal_id):

        try:
            goal = SavingsGoal.objects.get(
                id=goal_id,
                user=request.user,
                is_active=True
            )

        except SavingsGoal.DoesNotExist:
            return Response(
                {"error": "Goal not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = SavingsGoalSerializer(
            goal,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            updated_goal = SavingsGoalService.update_goal(
                goal,
                serializer.validated_data
            )

            return Response(
                SavingsGoalSerializer(updated_goal).data
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# -----------------------------------------
# DELETE SAVINGS GOAL (SOFT DELETE)
# -----------------------------------------

class SavingsGoalDeleteAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request, goal_id):

        try:
            goal = SavingsGoal.objects.get(
                id=goal_id,
                user=request.user,
                is_active=True
            )

        except SavingsGoal.DoesNotExist:
            return Response(
                {"error": "Goal not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        SavingsGoalService.soft_delete_goal(goal)

        return Response(
            {"message": "Goal deleted successfully"},
            status=status.HTTP_200_OK
        )
