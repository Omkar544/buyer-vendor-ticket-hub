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

    # 3. Formatted Date/Time Fields (Matches your "Expert" Dashboard look)
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
            'created_at_display',   # Added for frontend convenience
            'resolved_at_display'   # Added for frontend convenience
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
        Fetches the Vendor's name through the Ticket -> Category -> Vendor link.
        """
        try:
            if obj.category and obj.category.vendor:
                vendor = obj.category.vendor
                # Prioritize 'First Last', fallback to 'Username'
                full_name = f"{vendor.first_name} {vendor.last_name}".strip()
                return full_name if full_name else vendor.username
            
            # Fallback to Category Name if no user is linked yet
            return f"{obj.category.name} Agent" if obj.category else "Unassigned"
        except Exception:
            return "Pending Assignment"