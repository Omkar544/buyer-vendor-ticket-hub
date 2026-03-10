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
    Handles Buyer Registration. 
    Vendors are NOT allowed to register here.
    """
    data = request.data
    try:
        if User.objects.filter(username=data.get('username')).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=data['username'],
            password=data['password'],
            email=data.get('email', ''),
            first_name=data.get('first_name', '')
        )
        
        new_token, created = DBToken.objects.get_or_create(user=user)
        
        return Response({
            'token': new_token.key,
            'username': user.username,
            'is_staff': user.is_staff 
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Handles Login for BOTH Buyers and Pre-created Vendors.
    Identifies if the user belongs to TECHNICAL, BILLING, or HARDWARE.
    """
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    
    if user:
        login_token, created = DBToken.objects.get_or_create(user=user)
        
        # Check if this user has an associated VendorProfile
        user_category = None
        if hasattr(user, 'vendor_profile'):
            user_category = user.vendor_profile.category # Fetch 'TECHNICAL', 'BILLING', etc.

        return Response({
            'token': login_token.key,
            'username': user.username,
            'is_staff': user.is_staff,
            'category': user_category # Sends the department code to React
        })
    
    return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)