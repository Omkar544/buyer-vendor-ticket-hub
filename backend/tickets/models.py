from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

# --- NEW: Vendor Profile Model ---
# This links a User to a specific department (Tech, Billing, Hardware)
class VendorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='vendor_profile')
    category = models.CharField(max_length=20, choices=[
        ('TECHNICAL', 'Technical'),
        ('HARDWARE', 'Hardware'),
        ('BILLING', 'Billing'),
    ])

    def __str__(self):
        return f"{self.user.username} - {self.category} Vendor"

# --- EXISTING: Ticket Model ---
class Ticket(models.Model):
    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('RESOLVED', 'Resolved'),
        ('CLOSED', 'Closed'),
    ]
    
    PRIORITY_CHOICES = [
        ('LOW', 'Low (10 Days)'),
        ('MEDIUM', 'Medium (5 Days)'),
        ('HIGH', 'High (2 Days)'),
    ]

    CATEGORY_CHOICES = [
        ('TECHNICAL', 'Technical'),
        ('HARDWARE', 'Hardware'),
        ('BILLING', 'Billing'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='LOW')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='TECHNICAL')

    company = models.CharField(max_length=100, default="YBL")
    buyer_name = models.CharField(max_length=100)
    buyer_email = models.EmailField()
    buyer_phone = models.CharField(max_length=15, blank=True, null=True)

    resolution_notes = models.TextField(blank=True, null=True)
    resolved_at = models.DateTimeField(blank=True, null=True)

    buyer_user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='buyer_tickets'
    )
    
    due_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # 1. Automate Due Date based on Priority Level
        if not self.due_date:
            if self.priority == 'HIGH':
                self.due_date = timezone.now() + timedelta(days=2)
            elif self.priority == 'MEDIUM':
                self.due_date = timezone.now() + timedelta(days=5)
            else: # LOW
                self.due_date = timezone.now() + timedelta(days=10)
        
        # 2. Timestamp the resolution if status changes to RESOLVED
        if self.status == 'RESOLVED' and not self.resolved_at:
            self.resolved_at = timezone.now()
            
        super().save(*args, **kwargs)

    def __str__(self):
        return f"#{self.id} - {self.title} ({self.status})"