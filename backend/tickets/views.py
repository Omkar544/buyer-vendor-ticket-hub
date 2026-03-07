from rest_framework import viewsets, permissions
from rest_framework.response import Response
from .models import Ticket
from .serializers import TicketSerializer
from .analytics import generate_ticket_report

class TicketViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows tickets to be viewed or edited.
    Implements strict Buyer Ownership and Vendor Team Routing.
    """
    serializer_class = TicketSerializer
    # Ensure only authenticated users can access the API
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        1. Buyers: Only see tickets they created (Historical View).
        2. Vendors: See tickets filtered by their team category.
        3. Admins: See all tickets in sequential order.
        """
        user = self.request.user
        queryset = Ticket.objects.all().order_by('-created_at')

        # --- ADMIN ROLE: Global Oversight ---
        if user.is_staff and user.is_superuser:
            return queryset

        # --- VENDOR ROLE: Team-Based Filtering ---
        # Checks if 'category' is passed in the URL (e.g., ?category=TECHNICAL)
        category = self.request.query_params.get('category')
        if category:
            return queryset.filter(category=category)

        # --- BUYER ROLE: Ownership Filtering ---
        # Automatically restricts data to the logged-in Buyer's ID
        return queryset.filter(buyer_user=user)

    def perform_create(self, serializer):
        """
        Automatically links the new ticket to the logged-in Buyer.
        """
        # Save ticket with the current authenticated user as the owner
        serializer.save(buyer_user=self.request.user)
        
        # Trigger Seaborn engine to update Admin charts
        generate_ticket_report()

    def perform_update(self, serializer):
        """
        Updates ticket status and refreshes performance analytics.
        """
        serializer.save()
        generate_ticket_report()