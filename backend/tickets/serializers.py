from rest_framework import serializers
from .models import Ticket

class TicketSerializer(serializers.ModelSerializer):
    # 1. Human-readable Choice Displays
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    # 2. User Identity Fields
    buyer_username = serializers.ReadOnlyField(source='buyer_user.username')
    vendor_name = serializers.SerializerMethodField()

    # 3. Formatted Date/Time Fields
    created_at_display = serializers.DateTimeField(
        format="%d %b %Y, %I:%M %p", source='created_at', read_only=True
    )
    resolved_at_display = serializers.DateTimeField(
        format="%d %b %Y, %I:%M %p", source='resolved_at', read_only=True
    )

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
            'buyer_username', 
            'vendor_name', 
            'issue_proof', 
            'resolution_proof', 
            'resolution_notes', 
            'due_date', 
            'resolved_at', 
            'created_at',
            'created_at_display',
            'resolved_at_display'
        ]
        read_only_fields = [
            'buyer_user', 
            'due_date', 
            'resolved_at', 
            'status', 
            'created_at'
        ]

    def get_vendor_name(self, obj):
        """
        FIXED: Pulls the name directly from the assigned_vendor field 
        defined in your models.py.
        """
        try:
            # Check the assigned_vendor field on the Ticket instance
            if obj.assigned_vendor:
                v = obj.assigned_vendor
                full_name = f"{v.first_name} {v.last_name}".strip()
                return full_name if full_name else v.username
            
            # Fallback to the Category name if no specific person is assigned
            if obj.category:
                return f"{obj.category.name} Agent"
                
            return "Support Team"
        except Exception:
            return "Pending Assignment"