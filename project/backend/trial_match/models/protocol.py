from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.fields import JSONField
from trial_match.models.site import Site


class Protocol(models.Model):
    """
    Protocol model for storing clinical trial protocol data
    """
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('review', 'Review'),
        ('approved', 'Approved'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('terminated', 'Terminated'),
    )
    
    # Basic metadata
    title = models.CharField(max_length=255)
    version = models.CharField(max_length=50, default='1.0')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='draft')
    
    # Molecule information
    molecule_name = models.CharField(max_length=255)
    molecule_description = models.TextField(blank=True, null=True)
    molecule_type = models.CharField(max_length=100, blank=True, null=True)
    molecule_mechanism = models.TextField(blank=True, null=True)
    molecule_structure = models.TextField(blank=True, null=True)
    
    # Clinical trial information
    phase = models.CharField(max_length=50)
    therapeutic_area = models.CharField(max_length=100)
    condition = models.CharField(max_length=255)
    
    # Study design, criteria, endpoints (as JSON)
    study_design = JSONField(blank=True, null=True)
    criteria = JSONField(blank=True, null=True)
    endpoints = JSONField(blank=True, null=True)
    
    # Company and user information
    company = models.CharField(max_length=255)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # Content and generation information
    template_used = models.CharField(max_length=100, blank=True, null=True)
    protocol_outline = models.TextField(blank=True, null=True)
    uncertainty_flags = JSONField(blank=True, null=True)
    compliance_score = models.IntegerField(blank=True, null=True)
    compliance_issues = JSONField(blank=True, null=True)
    
    # Document management
    generated_document_url = models.CharField(max_length=255, blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} ({self.version})"
    
    class Meta:
        indexes = [
            models.Index(fields=['created_by']),
            models.Index(fields=['company']),
            models.Index(fields=['therapeutic_area']),
            models.Index(fields=['phase']),
            models.Index(fields=['status']),
        ]


class ProtocolTeamMember(models.Model):
    """
    Team members for a protocol
    """
    PERMISSION_CHOICES = (
        ('view', 'View'),
        ('edit', 'Edit'),
        ('approve', 'Approve'),
        ('admin', 'Admin'),
    )
    
    protocol = models.ForeignKey(Protocol, on_delete=models.CASCADE, related_name='team_members')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=100, blank=True, null=True)
    permissions = models.CharField(max_length=50, choices=PERMISSION_CHOICES, default='view')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('protocol', 'user')
        indexes = [
            models.Index(fields=['protocol']),
            models.Index(fields=['user']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.role} ({self.permissions})"


class ProtocolHistory(models.Model):
    """
    History of protocol versions
    """
    protocol = models.ForeignKey(Protocol, on_delete=models.CASCADE, related_name='history')
    version = models.CharField(max_length=50)
    date = models.DateTimeField(auto_now_add=True)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    changes = models.TextField(blank=True, null=True)
    document_snapshot = JSONField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.protocol.title} - v{self.version} ({self.date})"


class ProtocolObjective(models.Model):
    """
    Protocol objectives
    """
    TYPE_CHOICES = (
        ('primary', 'Primary'),
        ('secondary', 'Secondary'),
        ('exploratory', 'Exploratory'),
    )
    
    protocol = models.ForeignKey(Protocol, on_delete=models.CASCADE, related_name='objectives')
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    description = models.TextField()
    endpoints = JSONField(blank=True, null=True)
    timepoints = JSONField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.get_type_display()} objective for {self.protocol.title}"


class ProtocolSite(models.Model):
    """
    Protocol-site relationship for tracking site selection
    """
    STATUS_CHOICES = (
        ('selected', 'Selected'),
        ('contacted', 'Contacted'),
        ('confirmed', 'Confirmed'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('withdrawn', 'Withdrawn'),
    )
    
    protocol = models.ForeignKey(Protocol, on_delete=models.CASCADE, related_name='sites')
    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='protocols')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='selected')
    contact_date = models.DateTimeField(blank=True, null=True)
    confirmation_date = models.DateTimeField(blank=True, null=True)
    compatibility_score = models.FloatField(blank=True, null=True)
    recruitment_potential = models.FloatField(blank=True, null=True)
    strengths = JSONField(blank=True, null=True)
    weaknesses = JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('protocol', 'site')
        indexes = [
            models.Index(fields=['protocol']),
            models.Index(fields=['site']),
        ]
    
    def __str__(self):
        return f"{self.site.name} for {self.protocol.title}" 