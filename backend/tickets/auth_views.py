from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail  # Added for Real-Time Emails
from django.conf import settings         # Added to access email config
# ALIAS the import to prevent the 'no attribute objects' error
from rest_framework.authtoken.models import Token as DBToken 

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    Handles Buyer Registration with extended fields.
    Collects: Name, Email, Phone, Company, Username, and Password.
    NOW: Sends a real-time welcome email upon success.
    """
    data = request.data
    try:
        # 1. Validation: Check if user already exists
        if User.objects.filter(username=data.get('username')).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Create the User
        user = User.objects.create_user(
            username=data['username'],
            password=data['password'],
            email=data.get('email', ''),
            first_name=data.get('name', '') 
        )
        
        # 3. Handle Token
        new_token, created = DBToken.objects.get_or_create(user=user)

        # 4. NEW: REAL-TIME EMAIL SYSTEM (Requirement #6)
        if user.email:
            try:
                subject = "Welcome to TicketHub Pro - Account Activated"
                message = (
                    f"Hello {user.first_name if user.first_name else user.username},\n\n"
                    f"Welcome to TicketHub Pro! Your account has been successfully created.\n\n"
                    f"Account Details:\n"
                    f"- Username: {user.username}\n"
                    f"- Registered Company: {data.get('company', 'YBL')}\n\n"
                    f"You can now log in and start raising support tickets in real-time. Our agents are ready to assist you.\n\n"
                    f"Best Regards,\n"
                    f"System Administrator, TicketHub Pro"
                )
                send_mail(
                    subject,
                    message,
                    settings.EMAIL_HOST_USER,
                    [user.email],
                    fail_silently=True, # Prevents crash if SMTP is not configured yet
                )
            except Exception as email_err:
                print(f"Email could not be sent: {email_err}")
        
        # 5. Return Response
        return Response({
            'token': new_token.key,
            'username': user.username,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'name': user.first_name,
            'phone': data.get('phone', ''),
            'company': data.get('company', 'YBL')
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
            user_category = user.vendor_profile.category.name 

        return Response({
            'token': login_token.key,
            'username': user.username,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'category': user_category,
            'email': user.email,
            'name': user.first_name
        })
    
    return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)