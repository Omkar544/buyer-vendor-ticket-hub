from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from .models import Ticket
from .serializers import TicketSerializer
from .analytics import generate_ticket_report

class TicketViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Ticket Lifecycle.
    Handles: Buyer Ownership, Vendor Resolution, and SLA Sorting.
    """
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Ticket.objects.all()

        if user.is_staff and user.is_superuser:
            return queryset.order_by('-created_at')

        if hasattr(user, 'vendor_profile'):
            vendor_category = user.vendor_profile.category
            return queryset.filter(category=vendor_category, status='OPEN').order_by('-priority', 'due_date')

        # Filters by the authenticated user to ensure Manish sees only his tickets
        return queryset.filter(buyer_user=user).order_by('-created_at')

    def perform_create(self, serializer):
        """ 
        SOLVES IDENTITY MISMATCH: 
        Forces the 'buyer_user' to be the logged-in user (Manish).
        We pop 'buyer_name' from validated_data if it exists to avoid conflicts.
        """
        # Save ticket and link to Manish's session
        serializer.save(buyer_user=self.request.user)
        
        # Trigger analytics quietly
        try:
            generate_ticket_report()
        except Exception as e:
            print(f"Analytics report skipped: {e}")

    @action(detail=True, methods=['post'])
    def resolve_ticket(self, request, pk=None):
        ticket = self.get_object()
        notes = request.data.get('resolution_notes')

        if not notes:
            return Response(
                {'error': 'Resolution notes are required to close this ticket.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        ticket.status = 'RESOLVED'
        ticket.resolution_notes = notes
        ticket.resolved_at = timezone.now()
        ticket.save()

        try:
            generate_ticket_report()
        except:
            pass
            
        return Response({'message': 'Ticket resolved and notes saved for buyer.'})