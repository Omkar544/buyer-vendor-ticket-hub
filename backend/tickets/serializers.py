from rest_framework import serializers
from .models import Ticket

class TicketSerializer(serializers.ModelSerializer):
    # These fields provide human-readable text instead of database codes
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta: 
        model = Ticket
        fields = [
            'id', 
            'title', 
            'description', 
            'status', 
            'status_display',
            'priority', 
            'priority_display', 
            'category', 
            'category_display',
            'company',
            'buyer_name', 
            'buyer_email',
            'buyer_phone',
            'issue_proof',      # NEW: Field for buyer's attachment
            'resolution_proof', # NEW: Field for vendor's attachment
            'resolution_notes', 
            'due_date',         
            'resolved_at',      
            'created_at'
        ]
        
        # We REMOVED 'buyer_email' and 'buyer_name' from here 
        # so your frontend can successfully post them.
        read_only_fields = [
            'buyer_user', 
            'due_date', 
            'resolved_at', 
            'status',
        ]