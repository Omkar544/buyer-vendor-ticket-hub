from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from django.utils import timezone
from django.contrib.auth.models import User
from .models import Ticket, TicketCategory, VendorProfile
from .serializers import TicketSerializer
from .analytics import generate_ticket_report

# --- UPDATED: Vendor Registration Logic ---
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_vendor(request):
    """
    Creates a User and a Category named specifically after the Vendor's username.
    Also triggers an initial report generation for the new vendor.
    """
    data = request.data
    try:
        # 1. Create the User as Staff
        user = User.objects.create_user(
            username=data['username'],
            password=data['password'],
            email=data.get('email', ''),
            is_staff=True 
        )
        
        # 2. CREATE CATEGORY BASED ON USERNAME (Personalized Category)
        category_name = f"Agent: {user.username.capitalize()}"
        category_obj, created = TicketCategory.objects.get_or_create(
            name=category_name
        )
        
        # 3. Link Vendor to their specific category
        VendorProfile.objects.create(user=user, category=category_obj)
        
        # Trigger initial report to create the first PNG for this vendor
        try:
            generate_ticket_report()
        except:
            pass

        return Response({
            'message': f'Vendor {user.username} registered. Category "{category_name}" created.'
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# --- Category List for Buyer Dropdown ---
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_categories(request):
    """
    Returns categories which are now mapped to individual vendor names.
    """
    categories = TicketCategory.objects.all().values('id', 'name')
    return Response(categories)

# --- Ticket ViewSet ---
class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        ROLE-BASED DATA ISOLATION:
        1. Admin: Sees all tickets for global analysis.
        2. Vendor: Sees only tickets in their department/category.
        3. Buyer: Sees only their own created tickets.
        """
        user = self.request.user
        queryset = Ticket.objects.all()

        if user.is_superuser:
            return queryset.order_by('-created_at')

        if hasattr(user, 'vendor_profile'):
            vendor_category = user.vendor_profile.category
            return queryset.filter(category=vendor_category).order_by('-priority', 'due_date')

        return queryset.filter(buyer_user=user).order_by('-created_at')

    def perform_create(self, serializer):
        """
        Saves the ticket and triggers a global report update.
        """
        serializer.save(buyer_user=self.request.user)
        try:
            # Updates both Admin global charts and Vendor specific priority charts
            generate_ticket_report()
        except:
            pass

    @action(detail=True, methods=['post'])
    def resolve_ticket(self, request, pk=None):
        """
        Vendor action to mark ticket as resolved. 
        Triggers report regeneration so the Vendor's dashboard chart reflects the change immediately.
        """
        ticket = self.get_object()
        notes = request.data.get('resolution_notes')
        res_proof = request.FILES.get('resolution_proof')

        if not notes:
            return Response({'error': 'Resolution notes are required.'}, status=status.HTTP_400_BAD_REQUEST)

        ticket.status = 'RESOLVED'
        ticket.resolution_notes = notes
        if res_proof:
            ticket.resolution_proof = res_proof
        ticket.resolved_at = timezone.now()
        ticket.save()

        # Update analytics after resolution
        try:
            generate_ticket_report()
        except:
            pass
            
        return Response({'message': 'Ticket resolved. Dashboard analytics updated.'})