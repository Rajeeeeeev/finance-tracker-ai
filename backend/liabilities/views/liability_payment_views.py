from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
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
                {"error": "Liability not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        payment = LiabilityPaymentService.make_payment(
            request.user,
            liability
        )

        return Response({

            "message": "EMI payment recorded successfully",

            "amount": payment.amount,

            "principal_component": payment.principal_component,

            "interest_component": payment.interest_component,

        })
