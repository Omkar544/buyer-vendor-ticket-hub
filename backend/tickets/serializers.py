from rest_framework import serializers
from .models import Ticket

class TicketSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    # NEW: Pulling usernames from linked User models
    buyer_username = serializers.ReadOnlyField(source='buyer_user.username')
    vendor_username = serializers.ReadOnlyField(source='category.vendor.username')

    class Meta: 
        model = Ticket
        fields = [
            'id', 'title', 'description', 'status', 'status_display',
            'priority', 'priority_display', 'category', 'category_display',
            'company', 'buyer_name', 'buyer_email', 'buyer_phone',
            'buyer_username', 'vendor_username', # Added these
            'issue_proof', 'resolution_proof', 'resolution_notes', 
            'due_date', 'resolved_at', 'created_at'
        ]
        read_only_fields = ['buyer_user', 'due_date', 'resolved_at', 'status', 'created_at']