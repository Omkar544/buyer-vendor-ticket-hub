from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from tickets import views as ticket_views
from tickets import auth_views as ticket_identity 
from django.contrib.auth import views as django_staff_auth
from django.views.generic.base import RedirectView

router = DefaultRouter()
router.register(r'tickets', ticket_views.TicketViewSet, basename='ticket-api')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)), 
    
    # --- BUYER API ROUTES ---
    # We use 'register' as the name to satisfy internal Django template redirects
    path('api/auth/register/', ticket_identity.register_view, name='register'),
    path('api/auth/login/', ticket_identity.login_view, name='api-login'),
    
    # --- STAFF PORTAL (Django Templates) ---
    path('login/', django_staff_auth.LoginView.as_view(template_name='tickets/login.html'), name='login'),
    path('logout/', django_staff_auth.LogoutView.as_view(next_page='login'), name='logout'),
    
    # Redirect empty home page to prevent 404
    path('', RedirectView.as_view(url='login/', permanent=False)),
]