from django.db import models
from django.contrib.auth.models import User

class Ticket(models.Model):
    # Define Choices for Status and Priority
    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('IN_PROGRESS', 'In Progress'),
        ('RESOLVED', 'Resolved'),
        ('CLOSED', 'Closed'),
    ]
    
    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('CRITICAL', 'Critical'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    
    # Status & Priority
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='LOW')
    
    # Category (To be predicted by Hugging Face AI later)
    category = models.CharField(max_length=100, blank=True, null=True)
    
    # Relationships
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='buyer_tickets')
    vendor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='vendor_tickets')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"#{self.id} - {self.title}"