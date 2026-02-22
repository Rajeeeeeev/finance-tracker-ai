from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError

from liabilities.models import Liability
from liabilities.serializers import LiabilitySerializer
from liabilities.services.liability_service import LiabilityCloseService, LiabilityService


# -----------------------------------------
# CREATE LIABILITY
# -----------------------------------------


class LiabilityCreateAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = LiabilitySerializer(data=request.data)

        if serializer.is_valid():

            validated_data = serializer.validated_data.copy()

            # REMOVE calculated fields
            validated_data.pop("emi_amount", None)
            validated_data.pop("total_interest", None)
            validated_data.pop("total_payable", None)
            validated_data.pop("remaining_principal", None)
            validated_data.pop("remaining_months", None)

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
# PAYMENT HISTORY VIEW
# -----------------------------------------  

from liabilities.models import LiabilityPayment

class LiabilityPaymentHistoryAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, liability_id):

        payments = LiabilityPayment.objects.filter(
            liability_id=liability_id,
            user=request.user
        ).order_by("-payment_date")

        data = []

        for payment in payments:

            data.append({

                "id": payment.id,
                "amount": payment.amount,
                "payment_date": payment.payment_date,
                "principal_component": payment.principal_component,
                "interest_component": payment.interest_component,

            })

        return Response(data)

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
                {
                    "success": False,
                    "message": "Liability not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = LiabilitySerializer(
            liability,
            data=request.data,
            partial=True
        )

        serializer.is_valid(raise_exception=True)

        # ✅ Catch service layer validation error
        try:

            liability = LiabilityService.update_liability(
                liability,
                serializer.validated_data
            )

        except ValidationError as e:

            return Response(
                {
                    "success": False,
                    "message": str(e.detail[0])
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({
            "success": True,
            "message": "Liability updated successfully",
            "liability_id": liability.id,
            "name": liability.name,
            "emi_amount": liability.emi_amount,
            "remaining_principal": liability.remaining_principal,
            "remaining_months": liability.remaining_months,
            "end_date": liability.end_date
        })


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
# GET SINGLE LIABILITY
# -----------------------------------------

class LiabilityDetailAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, liability_id):

        try:

            liability = Liability.objects.get(
                id=liability_id,
                user=request.user
            )

        except Liability.DoesNotExist:

            return Response(
                {"error": "Liability not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = LiabilitySerializer(liability)

        return Response(serializer.data)
    
class EMIHistoryView(APIView):

     permission_classes = [IsAuthenticated]

     def get(self, request, liability_id):

        data = LiabilityService.get_emi_history(
            request.user,
            liability_id
        )

        return Response(data)

class LiabilityCloseAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, liability_id):

        liability = LiabilityCloseService.close_liability(
            request.user,
            liability_id
        )

        return Response({
            "message": "Liability closed successfully",
            "liability_id": liability.id,
            "remaining_principal": liability.remaining_principal,
            "is_active": liability.is_active,
            "end_date": liability.end_date
        })     