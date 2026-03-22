from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework import status

from liabilities.models import Liability
from liabilities.services.liability_payment_service import LiabilityPaymentService


class LiabilityPaymentCreateAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, liability_id):

        try:
            liability = Liability.objects.get(
                id=liability_id,
                user=request.user,
                is_active=True
            )
        except Liability.DoesNotExist:
            return Response(
                {"error": "Liability not found or already closed"},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            payment = LiabilityPaymentService.make_payment(
                request.user,
                liability
            )
        except ValidationError as e:
            # FIXED: catches "EMI already paid this month" and returns clean 400
            detail = e.detail
            if isinstance(detail, list):
                message = detail[0]
            elif isinstance(detail, dict):
                message = str(detail)
            else:
                message = str(detail)
            return Response(
                {"error": message},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({
            "message": "EMI payment recorded successfully",
            "amount": payment.amount,
            "principal_component": payment.principal_component,
            "interest_component": payment.interest_component,
        })