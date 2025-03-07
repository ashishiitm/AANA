from django.db import models
from django.contrib.postgres.fields import JSONField
from trial_match.models.site import Site


class SiteLocation(models.Model):
    """
    Location information for sites
    """
    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='locations')
    address1 = models.CharField(max_length=255, blank=True, null=True)
    address2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50)
    postal_code = models.CharField(max_length=20, blank=True, null=True)
    country = models.CharField(max_length=100, default='USA')
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.city}, {self.state} for {self.site}"
    
    class Meta:
        indexes = [
            models.Index(fields=['site']),
            models.Index(fields=['state', 'city']),
        ]


class SiteMetrics(models.Model):
    """
    Performance metrics for sites
    """
    site = models.OneToOneField(Site, on_delete=models.CASCADE, related_name='metrics')
    recruitment_rate = models.FloatField(blank=True, null=True)  # patients per month
    screen_failure_rate = models.FloatField(blank=True, null=True)  # percentage
    retention_rate = models.FloatField(blank=True, null=True)  # percentage
    data_quality_score = models.IntegerField(blank=True, null=True)  # 0-100
    startup_time = models.IntegerField(blank=True, null=True)  # days
    past_trial_count = models.IntegerField(blank=True, null=True)
    completed_trial_count = models.IntegerField(blank=True, null=True)
    avg_enrollment_efficiency = models.FloatField(blank=True, null=True)  # percentage of target achieved
    last_updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Metrics for {self.site}"


class TherapeuticExperience(models.Model):
    """
    Experience in therapeutic areas
    """
    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='therapeutic_experience')
    area = models.CharField(max_length=100)
    trial_count = models.IntegerField(default=0)
    patient_count = models.IntegerField(default=0)
    is_specialization = models.BooleanField(default=False)
    publication_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.area} experience for {self.site}"
    
    class Meta:
        unique_together = ('site', 'area')
        indexes = [
            models.Index(fields=['area']),
            models.Index(fields=['site']),
        ]


class SiteTrialExperience(models.Model):
    """
    Trial experience by phase
    """
    site = models.OneToOneField(Site, on_delete=models.CASCADE, related_name='trial_experience')
    phase1_count = models.IntegerField(default=0)
    phase2_count = models.IntegerField(default=0)
    phase3_count = models.IntegerField(default=0)
    phase4_count = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Trial experience for {self.site}"


class SitePastTrial(models.Model):
    """
    Past trials conducted at a site
    """
    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='past_trials')
    trial_id = models.CharField(max_length=100, blank=True, null=True)
    therapeutic_area = models.CharField(max_length=100, blank=True, null=True)
    phase = models.CharField(max_length=50, blank=True, null=True)
    year_completed = models.IntegerField(blank=True, null=True)
    patients_enrolled = models.IntegerField(blank=True, null=True)
    performance_rating = models.IntegerField(blank=True, null=True)  # 1-5
    
    def __str__(self):
        return f"{self.trial_id} at {self.site}"
    
    class Meta:
        indexes = [
            models.Index(fields=['therapeutic_area']),
            models.Index(fields=['phase']),
        ]


class SitePatientDemographics(models.Model):
    """
    Patient demographics at a site
    """
    site = models.OneToOneField(Site, on_delete=models.CASCADE, related_name='patient_demographics')
    pediatric_percent = models.FloatField(default=0)
    adult_percent = models.FloatField(default=0)
    geriatric_percent = models.FloatField(default=0)
    male_percent = models.FloatField(default=0)
    female_percent = models.FloatField(default=0)
    ethnicity_data = JSONField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Patient demographics for {self.site}"


class SiteOutreachHistory(models.Model):
    """
    History of site outreach communications
    """
    METHOD_CHOICES = (
        ('email', 'Email'),
        ('phone', 'Phone'),
        ('mail', 'Mail'),
        ('in-person', 'In-person'),
    )
    
    STATUS_CHOICES = (
        ('sent', 'Sent'),
        ('received', 'Received'),
        ('responded', 'Responded'),
        ('declined', 'Declined'),
        ('accepted', 'Accepted'),
    )
    
    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='outreach_history')
    protocol = models.ForeignKey('Protocol', on_delete=models.SET_NULL, null=True, related_name='outreach_history')
    date = models.DateTimeField(auto_now_add=True)
    method = models.CharField(max_length=50, choices=METHOD_CHOICES)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='sent')
    response_date = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.get_method_display()} outreach to {self.site} on {self.date.strftime('%Y-%m-%d')}"
    
    class Meta:
        indexes = [
            models.Index(fields=['site']),
            models.Index(fields=['protocol']),
            models.Index(fields=['date']),
        ]
        verbose_name_plural = "Site outreach history" 