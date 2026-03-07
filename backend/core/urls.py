from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from tickets import views as ticket_views
from tickets import auth_views as ticket_auth  # Import your new auth views
from django.contrib.auth import views as auth_views

# Initialize the REST Framework Router
# Handles: GET (History/List), POST (Creation), PATCH (Status Updates)
router = DefaultRouter()
router.register(r'tickets', ticket_views.TicketViewSet, basename='ticket-api')

urlpatterns = [
    # --- Admin Panel ---
    path('admin/', admin.site.urls),
    
    # --- REST API Endpoints (Primary for React) ---
    path('api/', include(router.urls)), 
    
    # --- Buyer Authentication (Identity Layer) ---
    # These endpoints link your Auth.jsx to the PostgreSQL Data Tier
    path('api/auth/register/', ticket_auth.register_view, name='api-register'),
    path('api/auth/login/', ticket_auth.login_view, name='api-login'),
    
    # --- Staff/Vendor Access (Web Interface) ---
    path('login/', auth_views.LoginView.as_view(template_name='tickets/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='login'), name='logout'),
    
    # --- Root URL Entry ---
    path('', include(router.urls)),
]