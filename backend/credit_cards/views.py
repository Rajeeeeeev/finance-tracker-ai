from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Sum

from .models import CreditCard
from .serializers import CreditCardSerializer, CreditCardExpenseSerializer
from .services import get_card_summary, auto_create_bill_reminder
from expenses.models import Expense
import datetime


class CreditCardListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cards = CreditCard.objects.filter(user=request.user, is_active=True)
        serializer = CreditCardSerializer(cards, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CreditCardSerializer(data=request.data)
        if serializer.is_valid():
            card = serializer.save(user=request.user)
            auto_create_bill_reminder(card, request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CreditCardDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        card = get_object_or_404(CreditCard, pk=pk, user=request.user)
        return Response(get_card_summary(card))

    def put(self, request, pk):
        card = get_object_or_404(CreditCard, pk=pk, user=request.user)
        serializer = CreditCardSerializer(card, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        card = get_object_or_404(CreditCard, pk=pk, user=request.user)
        card.is_active = False
        card.save()
        return Response({'message': 'Card removed.'}, status=status.HTTP_204_NO_CONTENT)


class CreditCardExpensesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        card     = get_object_or_404(CreditCard, pk=pk, user=request.user)
        month    = request.query_params.get('month')
        year     = request.query_params.get('year')
        expenses = Expense.objects.filter(credit_card=card, user=request.user)

        if month and year:
            expenses = expenses.filter(created_at__month=month, created_at__year=year)
        else:
            today = datetime.date.today()
            if today.day >= card.billing_date:
                cycle_start = today.replace(day=card.billing_date)
            else:
                first       = today.replace(day=1)
                prev_month  = first - datetime.timedelta(days=1)
                cycle_start = prev_month.replace(day=card.billing_date)
            
            # ✅ FIX: Use created_at instead of date
            cycle_start_dt = datetime.datetime.combine(cycle_start, datetime.time.min)
            expenses = expenses.filter(created_at__gte=cycle_start_dt)

        serializer = CreditCardExpenseSerializer(expenses.order_by('-created_at'), many=True)
        return Response({
            'card':     card.card_name,
            'expenses': serializer.data,
            'total':    float(expenses.aggregate(t=Sum('amount'))['t'] or 0)
        })


class AllCardsSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cards     = CreditCard.objects.filter(user=request.user, is_active=True)
        summaries = [get_card_summary(card) for card in cards]

        total_limit   = sum(s['credit_limit'] for s in summaries)
        total_balance = sum(s['current_balance'] for s in summaries)

        return Response({
            'cards':                summaries,
            'total_credit_limit':   total_limit,
            'total_balance':        total_balance,
            'total_available':      total_limit - total_balance,
            'overall_utilization':  round(total_balance / total_limit * 100, 2) if total_limit else 0,
        })