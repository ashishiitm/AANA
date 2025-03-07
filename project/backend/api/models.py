from django.db import models
from django.utils import timezone
from core.models import PubMedArticle
import json

# Create your models here.

class Studies(models.Model):
    study_id = models.IntegerField(primary_key=True)  # Matches table PK
    nct_id = models.CharField(max_length=20, unique=True)
    official_title = models.CharField(max_length=1000)
    brief_summary = models.TextField(null=True, blank=True)
    overall_status = models.CharField(max_length=50)
    study_type = models.CharField(max_length=50)
    primary_purpose = models.CharField(max_length=50)
    allocation = models.CharField(max_length=50, null=True, blank=True)
    interventional_model = models.CharField(max_length=50, null=True, blank=True)
    masking = models.CharField(max_length=50, null=True, blank=True)
    eligibility_criteria = models.TextField(null=True, blank=True)
    ipd_sharing = models.CharField(max_length=10, null=True, blank=True)
    is_fda_regulated_drug = models.BooleanField()
    is_fda_regulated_device = models.BooleanField()
    completion_date = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    sponsor = models.CharField(max_length=255, null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.official_title  # Use official_title since brief_title isn’t in table

    class Meta:
        db_table = 'studies'  # Map to existing table
        managed = False       # Prevent Django from managing this table
        verbose_name_plural = "Studies"

class AdverseEventTerm(models.Model):
    CATEGORY_CHOICES = [
        ('GENERAL', 'General'),
        ('CARDIOVASCULAR', 'Cardiovascular'),
        ('RESPIRATORY', 'Respiratory'),
        ('GASTROINTESTINAL', 'Gastrointestinal'),
        ('NEUROLOGICAL', 'Neurological'),
        ('PSYCHIATRIC', 'Psychiatric'),
        ('MUSCULOSKELETAL', 'Musculoskeletal'),
        ('DERMATOLOGICAL', 'Dermatological'),
        ('HEMATOLOGICAL', 'Hematological'),
        ('RENAL', 'Renal'),
        ('HEPATIC', 'Hepatic'),
        ('ENDOCRINE', 'Endocrine'),
        ('IMMUNOLOGICAL', 'Immunological'),
        ('OTHER', 'Other'),
    ]
    
    term = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='GENERAL')
    description = models.TextField(null=True, blank=True)
    synonyms = models.TextField(null=True, blank=True, help_text="Comma-separated list of synonyms")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.term} ({self.category})"

    class Meta:
        verbose_name = 'Adverse Event Term'
        verbose_name_plural = 'Adverse Event Terms'
        unique_together = ['term', 'category']


class SearchRule(models.Model):
    FREQUENCY_CHOICES = [
        ('DAILY', 'Daily'),
        ('WEEKLY', 'Weekly'),
        ('MONTHLY', 'Monthly'),
        ('MANUAL', 'Manual'),
    ]
    
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('ARCHIVED', 'Archived'),
    ]
    
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    drug_name = models.CharField(max_length=255)
    adverse_event_terms = models.ManyToManyField(AdverseEventTerm, related_name='search_rules')
    additional_keywords = models.TextField(null=True, blank=True, help_text="Additional keywords separated by commas")
    date_range_start = models.DateField(null=True, blank=True)
    date_range_end = models.DateField(null=True, blank=True)
    frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES, default='MANUAL')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='ACTIVE')
    last_run = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    def run_search(self):
        """Execute the search and create SearchResult objects"""
        self.last_run = timezone.now()
        self.save()
        # Logic to run the search will be implemented in a service

    class Meta:
        verbose_name = 'Search Rule'
        verbose_name_plural = 'Search Rules'


class SearchResult(models.Model):
    REVIEW_STATUS_CHOICES = [
        ('PENDING', 'Pending Review'),
        ('REVIEWED', 'Reviewed'),
        ('FLAGGED', 'Flagged for Follow-up'),
        ('DISMISSED', 'Dismissed'),
    ]
    
    search_rule = models.ForeignKey(SearchRule, on_delete=models.CASCADE, related_name='results')
    article = models.ForeignKey(PubMedArticle, on_delete=models.CASCADE, related_name='api_search_results')
    matched_terms = models.TextField(help_text="Comma-separated list of matched terms")
    review_status = models.CharField(max_length=20, choices=REVIEW_STATUS_CHOICES, default='PENDING')
    reviewer_notes = models.TextField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.search_rule.name} - {self.article.pmid}"

    def mark_reviewed(self, notes=None):
        self.review_status = 'REVIEWED'
        if notes:
            self.reviewer_notes = notes
        self.reviewed_at = timezone.now()
        self.save()

    class Meta:
        verbose_name = 'Search Result'
        verbose_name_plural = 'Search Results'
        unique_together = ['search_rule', 'article']
