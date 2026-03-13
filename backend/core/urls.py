import os
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from tickets import views as ticket_views
from tickets import auth_views as ticket_identity 
from django.contrib.auth import views as django_staff_auth
from django.views.generic.base import RedirectView
from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r'tickets', ticket_views.TicketViewSet, basename='ticket-api')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)), 
    
    # --- BUYER & VENDOR API AUTH ROUTES ---
    path('api/auth/register/', ticket_identity.register_view, name='register'),
    path('api/auth/login/', ticket_identity.login_view, name='api-login'),
    
    # Vendor Team Registration (Handles Category + User + Profile)
    path('api/auth/register-vendor/', ticket_views.register_vendor, name='register-vendor'),
    
    # FIXED: Matching the frontend request for /api/get-categories/
    path('api/get-categories/', ticket_views.get_categories, name='api-get-categories'),
    
    # --- STAFF PORTAL (Django Templates) ---
    path('login/', django_staff_auth.LoginView.as_view(template_name='tickets/login.html'), name='login'),
    path('logout/', django_staff_auth.LogoutView.as_view(next_page='login'), name='logout'),
    
    # Redirect empty home page to prevent 404
    path('', RedirectView.as_view(url='login/', permanent=False)),
]

# --- MEDIA & STATIC CONFIGURATION ---
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])