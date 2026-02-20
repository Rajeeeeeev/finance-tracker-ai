from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from liabilities.models import Liability
from liabilities.serializers import LiabilitySerializer
from liabilities.services.liability_service import LiabilityService


# -----------------------------------------
# CREATE LIABILITY
# -----------------------------------------


class LiabilityCreateAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = LiabilitySerializer(data=request.data)

        if serializer.is_valid():

            # Use validated_data safely
            validated_data = serializer.validated_data

            liability = LiabilityService.create_liability(
                user=request.user,
                validated_data=validated_data
            )

            response_serializer = LiabilitySerializer(liability)

            return Response(
                response_serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# -----------------------------------------
# LIST LIABILITIES
# -----------------------------------------

class LiabilityListAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        liabilities = LiabilityService.get_user_liabilities(
            request.user
        )

        serializer = LiabilitySerializer(
            liabilities,
            many=True
        )

        return Response(serializer.data)


# -----------------------------------------
# UPDATE LIABILITY
# -----------------------------------------

class LiabilityUpdateAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def put(self, request, liability_id):

        try:

            liability = Liability.objects.get(
                id=liability_id,
                user=request.user,
                is_active=True
            )

        except Liability.DoesNotExist:

            return Response(
                {"error": "Liability not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = LiabilitySerializer(
            liability,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            liability = LiabilityService.update_liability(
                liability,
                serializer.validated_data
            )

            return Response(
                LiabilitySerializer(liability).data
            )

        return Response(serializer.errors)


# -----------------------------------------
# DELETE LIABILITY
# -----------------------------------------

class LiabilityDeleteAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request, liability_id):

        try:

            liability = Liability.objects.get(
                id=liability_id,
                user=request.user,
                is_active=True
            )

        except Liability.DoesNotExist:

            return Response(
                {"error": "Liability not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        LiabilityService.soft_delete_liability(liability)

        return Response({
            "message": "Liability deleted successfully"
        })
