from django.contrib import admin
from .models import Liability, LiabilityPayment


admin.site.register(Liability)
admin.site.register(LiabilityPayment)