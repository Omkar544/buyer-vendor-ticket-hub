from django.contrib import admin
from django.urls import path
from tickets import views as ticket_views
from django.contrib.auth import views as auth_views

urlpatterns = [
    # Admin Panel
    path('admin/', admin.site.urls),
    
    # User Registration
    path('register/', ticket_views.register, name='register'),
    
    # Login & Logout (Uses built-in Django Auth Views)
    path('login/', auth_views.LoginView.as_view(template_name='tickets/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='login'), name='logout'),
    
    # System Dashboard
    path('dashboard/', ticket_views.dashboard, name='dashboard'),
    
    # Root URL redirects to dashboard
    path('', ticket_views.dashboard, name='home'),
]