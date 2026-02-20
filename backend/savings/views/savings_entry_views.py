from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from savings.models import SavingsEntry
from savings.serializers import SavingsEntrySerializer
from savings.services.savings_entry_service import SavingsEntryService


# -----------------------------------------
# CREATE SAVINGS ENTRY
# -----------------------------------------

class SavingsEntryCreateAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = SavingsEntrySerializer(data=request.data)

        if serializer.is_valid():

            entry = SavingsEntryService.create_entry(
                user=request.user,
                validated_data=serializer.validated_data
            )

            return Response(
                SavingsEntrySerializer(entry).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# -----------------------------------------
# LIST SAVINGS ENTRIES
# -----------------------------------------

class SavingsEntryListAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        entries = SavingsEntryService.get_user_entries(request.user)

        serializer = SavingsEntrySerializer(entries, many=True)

        return Response(serializer.data)


# -----------------------------------------
# DELETE SAVINGS ENTRY
# -----------------------------------------

class SavingsEntryDeleteAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request, entry_id):

        try:
            entry = SavingsEntry.objects.get(
                id=entry_id,
                user=request.user,
                is_active=True
            )

        except SavingsEntry.DoesNotExist:
            return Response(
                {"error": "Entry not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        SavingsEntryService.delete_entry(entry)

        return Response(
            {"message": "Entry deleted successfully"},
            status=status.HTTP_200_OK
        )
