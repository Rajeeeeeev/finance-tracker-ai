from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import RecurringExpense
from .serializers import RecurringExpenseSerializer


class RecurringExpenseListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        expenses = RecurringExpense.objects.filter(user=request.user)

        serializer = RecurringExpenseSerializer(expenses, many=True)

        return Response(serializer.data)


    def post(self, request):

        serializer = RecurringExpenseSerializer(data=request.data)

        if serializer.is_valid():

            serializer.save(user=request.user)

            return Response(serializer.data)

        return Response(serializer.errors)


class RecurringExpenseDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def put(self, request, pk):

        expense = RecurringExpense.objects.get(pk=pk)

        serializer = RecurringExpenseSerializer(
            expense,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(serializer.errors)


    def delete(self, request, pk):

        expense = RecurringExpense.objects.get(pk=pk)

        expense.delete()

        return Response({"message": "Deleted"})