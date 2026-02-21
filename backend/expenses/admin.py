from django.contrib import admin
from .models import Expense


from django.contrib import admin
from .models import Expense, BillReminder, Budget, RecurringExpense


admin.site.register(Expense)
admin.site.register(BillReminder)
admin.site.register(Budget)
admin.site.register(RecurringExpense)