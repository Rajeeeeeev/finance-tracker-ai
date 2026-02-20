from django.contrib import admin
from .models import Income


@admin.register(Income)
class IncomeAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "user",
        "source_name",
        "income_type",
        "amount",
        "date",
        "created_at",
    )

    list_filter = (
        "income_type",
    )

    search_fields = (
        "source_name",
        "user__username",
    )
