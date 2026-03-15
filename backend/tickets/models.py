from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

# 1. NEW: Dynamic Category Model
# When a vendor registers, their team name is added here.

class TicketCategory(models.Model):
    name = models.CharField(max_length=100, unique=True) # e.g., TECHNICAL, LOGISTICS
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

# 2. UPDATED: Vendor Profile Model
class VendorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='vendor_profile')
    # Linked to the dynamic category
    category = models.ForeignKey(TicketCategory, on_delete=models.CASCADE, related_name='vendors')

    def __str__(self):
        return f"{self.user.username} ({self.category.name} Team)"

# 3. UPDATED: Ticket Model with Auto-Assignment
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

    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='LOW')
    
    # Updated to ForeignKey for dynamic dropdown support
    category = models.ForeignKey(TicketCategory, on_delete=models.PROTECT, related_name='tickets')

    company = models.CharField(max_length=100, default="YBL")
    buyer_name = models.CharField(max_length=100)
    buyer_email = models.EmailField() 
    buyer_phone = models.CharField(max_length=15, blank=True, null=True)

    # Proof fields for Buyer and Vendor
    issue_proof = models.FileField(upload_to='tickets/issue_proofs/', blank=True, null=True)
    resolution_proof = models.FileField(upload_to='tickets/res_proofs/', blank=True, null=True)

    resolution_notes = models.TextField(blank=True, null=True)
    resolved_at = models.DateTimeField(blank=True, null=True)

    # The user who created the ticket
    buyer_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='buyer_tickets')
    
    # NEW: Automated Assignment to a Vendor User
    assigned_vendor = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='assigned_vendor_tickets'
    )

    due_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # A. Automate Due Date
        if not self.due_date:
            days = {'HIGH': 2, 'MEDIUM': 5, 'LOW': 10}
            self.due_date = timezone.now() + timedelta(days=days.get(self.priority, 10))
        
        # B. Timestamp Resolution
        if self.status == 'RESOLVED' and not self.resolved_at:
            self.resolved_at = timezone.now()
            
        # C. NEW: Auto-Assign to the first available vendor in that category
        if not self.assigned_vendor:
            vendor_profile = VendorProfile.objects.filter(category=self.category).first()
            if vendor_profile:
                self.assigned_vendor = vendor_profile.user
                
        super().save(*args, **kwargs)

    def __str__(self):
        return f"#{self.id} - {self.title} ({self.status})"