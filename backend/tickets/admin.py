from django.contrib import admin
from .models import Ticket

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'buyer_user', 'buyer_name', 'status', 'category')
    list_filter = ('status', 'priority', 'category')