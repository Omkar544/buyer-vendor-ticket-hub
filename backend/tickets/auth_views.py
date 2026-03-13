from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
# ALIAS the import to prevent the 'no attribute objects' error
from rest_framework.authtoken.models import Token as DBToken 

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    Handles Buyer Registration with extended fields.
    Collects: Name, Email, Phone, Company, Username, and Password.
    """
    data = request.data
    try:
        # 1. Validation: Check if user already exists
        if User.objects.filter(username=data.get('username')).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Create the User
        # We store the "Full Name" in first_name
        user = User.objects.create_user(
            username=data['username'],
            password=data['password'],
            email=data.get('email', ''),
            first_name=data.get('name', '') # Collects the 'Full Name' field
        )
        
        # 3. Handle Token
        new_token, created = DBToken.objects.get_or_create(user=user)
        
        # 4. Return Response
        # We send back the phone and company so React can save them to localStorage
        return Response({
            'token': new_token.key,
            'username': user.username,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'name': user.first_name,
            'phone': data.get('phone', ''),    # Sent back for frontend storage
            'company': data.get('company', 'YBL') # Sent back for frontend storage
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Handles Login for Buyers, Vendors, and Admins.
    Identifies if the user is a Superuser (Admin) or belongs to a Department.
    """
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    
    if user:
        login_token, created = DBToken.objects.get_or_create(user=user)
        
        # Check for Vendor Profile
        user_category = None
        if hasattr(user, 'vendor_profile'):
            # Fetch the name from the TicketCategory relationship
            user_category = user.vendor_profile.category.name 

        return Response({
            'token': login_token.key,
            'username': user.username,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser, # CRITICAL: Tells React to show Admin Dashboard
            'category': user_category,
            'email': user.email,
            'name': user.first_name
        })
    
    return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)