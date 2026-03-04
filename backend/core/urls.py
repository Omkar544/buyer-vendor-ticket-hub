from django.contrib import admin
from django.urls import path, include
from tickets import views as ticket_views
from django.contrib.auth import views as auth_views
from rest_framework.routers import DefaultRouter

# Initialize the REST Framework Router
router = DefaultRouter()
router.register(r'tickets', ticket_views.TicketViewSet, basename='ticket-api')

urlpatterns = [
    # --- Admin Panel ---
    path('admin/', admin.site.urls),
    
    # --- REST API Endpoints (For React) ---
    # This will expose your data at http://127.0.0.1:8000/api/tickets/
    path('api/', include(router.urls)), 
    
    # --- User Registration ---
    path('register/', ticket_views.register, name='register'),
    
    # --- Login & Logout ---
    path('login/', auth_views.LoginView.as_view(template_name='tickets/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='login'), name='logout'),
    
    # --- System Dashboard (HTML Views) ---
    path('dashboard/', ticket_views.dashboard, name='dashboard'),
    
    # --- Root URL ---
    path('', ticket_views.dashboard, name='home'),
]