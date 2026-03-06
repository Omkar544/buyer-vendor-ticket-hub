from django.db import models
from django.contrib.auth.models import User

class Ticket(models.Model):
    # --- PREDEFINED CHOICES ---
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

    CATEGORY_CHOICES = [
        ('TECHNICAL', 'Technical'),
        ('HARDWARE', 'Hardware'),
        ('BILLING', 'Billing'),
        ('OTHER', 'Other'),
    ]

    # Added granular subcategories as seen in enterprise systems
    SUBCATEGORY_CHOICES = [
        ('LDAP', 'LDAP / Authentication'),
        ('APP', 'Application Interface'),
        ('NETWORK', 'Network Connectivity'),
        ('CTS', 'CTS Service'),
        ('DATABASE', 'Database Management'),
        ('INVOICE', 'Billing/Invoice Issue'),
    ]

    # --- CORE FIELDS ---
    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='LOW')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='TECHNICAL')
    subcategory = models.CharField(max_length=50, choices=SUBCATEGORY_CHOICES, default='APP')

    # --- CONTACT & COMPANY FIELDS ---
    company = models.CharField(max_length=100, default="YBL")
    buyer_name = models.CharField(max_length=100)
    buyer_email = models.EmailField()
    buyer_phone = models.CharField(max_length=15, blank=True, null=True)

    # --- RELATIONSHIPS ---
    buyer_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='buyer_tickets')
    assigned_vendor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='vendor_tickets')
    
    # --- TIMESTAMPS ---
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"#{self.id} - {self.title} ({self.buyer_name})"