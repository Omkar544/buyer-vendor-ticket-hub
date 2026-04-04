from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail 
from django.conf import settings 
from rest_framework.authtoken.models import Token as DBToken 

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    data = request.data
    # DEBUG: Check your terminal to see if 'name' is actually in this dictionary
    print(f"DEBUG: Received data from frontend: {data}")
    
    try:
        if User.objects.filter(username=data.get('username')).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

        # Create user and explicitly map 'name' to 'first_name'
        user = User.objects.create_user(
            username=data.get('username'),
            password=data.get('password'),
            email=data.get('email', ''),
            first_name=data.get('name', '')  # React sends 'name', Django stores in 'first_name'
        )
        
        # Ensure the name is saved if create_user didn't pick it up for some reason
        if not user.first_name and data.get('name'):
            user.first_name = data.get('name')
            user.save()

        new_token, created = DBToken.objects.get_or_create(user=user)

        # REAL-TIME EMAIL SYSTEM
        if user.email:
            try:
                subject = "Welcome to TicketHub Pro - Account Activated"
                # Use the name provided or fallback to username
                display_name = user.first_name if user.first_name else user.username
                message = (
                    f"Hello {display_name},\n\n"
                    f"Welcome to TicketHub Pro! Your account has been successfully created.\n\n"
                    f"Account Details:\n"
                    f"- Username: {user.username}\n"
                    f"- Registered Company: {data.get('company', 'YBL')}\n\n"
                    f"You can now log in and start raising support tickets in real-time.\n\n"
                    f"Best Regards,\n"
                    f"System Administrator, TicketHub Pro"
                )
                send_mail(
                    subject, message, settings.EMAIL_HOST_USER, [user.email],
                    fail_silently=True,
                )
            except Exception as email_err:
                print(f"Email could not be sent: {email_err}")
        
        return Response({
            'token': new_token.key,
            'username': user.username,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'name': user.first_name, # Return the saved name back to React
            'phone': data.get('phone', ''),
            'company': data.get('company', 'YBL')
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    
    if user:
        update_last_login(None, user) 
        login_token, created = DBToken.objects.get_or_create(user=user)
        
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
            'name': user.first_name # Ensure this is being sent to React
        })
    
    return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)