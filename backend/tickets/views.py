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
        # This makes the vendor's username appear in the Buyer's dropdown
        category_name = f"Agent: {user.username.capitalize()}"
        category_obj, created = TicketCategory.objects.get_or_create(
            name=category_name
        )
        
        # 3. Link Vendor to their specific category
        VendorProfile.objects.create(user=user, category=category_obj)
        
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
        user = self.request.user
        queryset = Ticket.objects.all()

        # 1. ADMIN (Superuser): Sees every ticket across all vendors
        if user.is_superuser:
            return queryset.order_by('-created_at')

        # 2. VENDOR: Sees only tickets assigned specifically to their name (category)
        if hasattr(user, 'vendor_profile'):
            vendor_category = user.vendor_profile.category
            return queryset.filter(category=vendor_category).order_by('-priority', 'due_date')

        # 3. BUYER: Sees only tickets they raised
        return queryset.filter(buyer_user=user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(buyer_user=self.request.user)
        try:
            generate_ticket_report()
        except:
            pass

    @action(detail=True, methods=['post'])
    def resolve_ticket(self, request, pk=None):
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

        try:
            generate_ticket_report()
        except:
            pass
            
        return Response({'message': 'Ticket resolved with proof saved.'})