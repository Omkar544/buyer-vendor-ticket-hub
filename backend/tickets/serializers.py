from rest_framework import serializers
from .models import Ticket

class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = [
            'id', 'title', 'description', 'status', 'priority', 'category', 
            'subcategory', 'company', 'buyer_name', 'buyer_email', 'buyer_phone',
            'created_at', 'updated_at'
        ]