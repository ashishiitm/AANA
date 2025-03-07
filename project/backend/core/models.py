from django.db import models
from django.utils import timezone
import json

class Studies(models.Model):
    study_id = models.IntegerField(primary_key=True)  # If study_id is the primary key
    nct_id = models.CharField(max_length=20, unique=True)
    official_title = models.CharField(max_length=1000)
    brief_summary = models.TextField(blank=True, null=True)
    overall_status = models.CharField(max_length=50)
    study_type = models.CharField(max_length=50)
    primary_purpose = models.CharField(max_length=50)
    allocation = models.CharField(max_length=50, blank=True, null=True)
    interventional_model = models.CharField(max_length=50, blank=True, null=True)
    masking = models.CharField(max_length=50, blank=True, null=True)
    eligibility_criteria = models.TextField(blank=True, null=True)
    ipd_sharing = models.CharField(max_length=10, blank=True, null=True)
    is_fda_regulated_drug = models.BooleanField(default=False)
    is_fda_regulated_device = models.BooleanField(default=False)
    start_date = models.DateField(blank=True, null=True, default=None)
    completion_date = models.DateField(blank=True, null=True, default=None)
    sponsor = models.CharField(max_length=255, blank=True, null=True, default='Not specified')
    location = models.CharField(max_length=255, blank=True, null=True, default='Not specified')

    class Meta:
        db_table = 'studies'

    def __str__(self):
        return self.official_title


class StudyEnrollmentRequest(models.Model):
    nct_id = models.CharField(max_length=20)
    study_id = models.CharField(max_length=50)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    condition_description = models.TextField()
    terms_accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    email_sent = models.BooleanField(default=False)
    email_sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'core_study_enrollment_request'

    def __str__(self):
        return f"{self.name} - {self.nct_id}"

    def send_confirmation_email(self):
        from django.core.mail import send_mail
        from django.conf import settings
        from django.template.loader import render_to_string

        subject = f"Clinical Trial Enrollment Request Confirmation - {self.nct_id}"

        # Get study details
        study = Studies.objects.get(nct_id=self.nct_id)

        context = {
            'name': self.name,
            'nct_id': self.nct_id,
            'study_title': study.official_title,
            'brief_description': study.brief_summary,
            'eligibility_criteria': study.eligibility_criteria,
        }

        # Render email body from template
        html_content = render_to_string('emails/enrollment_confirmation.html', context)
        text_content = render_to_string('emails/enrollment_confirmation.txt', context)

        try:
            send_mail(
                subject=subject,
                message=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[self.email],
                html_message=html_content,
                fail_silently=False,
            )
            self.email_sent = True
            self.email_sent_at = timezone.now()
            self.save()
            return True
        except Exception as e:
            print(f"Failed to send email: {str(e)}")
            return False


class Doctor(models.Model):
    """
    Basic Doctor model matching the fields used in views.py queries.
    Adjust field types and names as needed to align with your database schema.
    """
    doctor_id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    specialty_description = models.TextField(blank=True, null=True)
    years_experience = models.IntegerField(blank=True, null=True)
    license_state = models.CharField(max_length=2)
    license_number = models.CharField(max_length=20)

    class Meta:
        db_table = 'doctors'

    def __str__(self):
        return f"{self.doctor_id} - {self.first_name} {self.last_name}"

# Pharmacovigilance Models

class SearchRule(models.Model):
    """
    Model for storing search rules for PubMed literature review
    """
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('8_hours', 'Every 8 Hours'),
        ('12_hours', 'Every 12 Hours'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]
    
    name = models.CharField(max_length=255, help_text="Name of the search rule")
    description = models.TextField(blank=True, null=True, help_text="Description of the search purpose")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True, help_text="Whether this rule is currently active")
    last_run = models.DateTimeField(null=True, blank=True, help_text="When this rule was last executed")
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, default='daily', 
                               help_text="How often to run this search")
    email_notifications = models.BooleanField(default=True, help_text="Send email notifications for new results")
    notification_emails = models.TextField(blank=True, null=True, 
                                        help_text="Comma-separated list of email addresses to notify")
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'pv_search_rules'


class SearchCriterion(models.Model):
    """
    Individual search criterion within a rule
    """
    FIELD_CHOICES = [
        ('keyword', 'Keyword'),
        ('author', 'Author'),
        ('exact_phrase', 'Exact Phrase'),
        ('drug_name', 'Drug Name'),
        ('company_name', 'Company Name'),
        ('generic_name', 'Generic Name'),
        ('inn_name', 'INN Name'),
        ('adverse_event', 'Adverse Event Term'),
    ]
    
    OPERATOR_CHOICES = [
        ('AND', 'AND'),
        ('OR', 'OR'),
    ]
    
    search_rule = models.ForeignKey(SearchRule, on_delete=models.CASCADE, related_name='criteria')
    field_type = models.CharField(max_length=20, choices=FIELD_CHOICES)
    value = models.CharField(max_length=255, help_text="Search term value")
    operator = models.CharField(max_length=5, choices=OPERATOR_CHOICES, default='AND', 
                              help_text="Logical operator to connect with other criteria")
    group = models.IntegerField(default=0, help_text="Group number for complex logical grouping")
    order = models.IntegerField(default=0, help_text="Order within the search rule")
    
    def __str__(self):
        return f"{self.field_type}: {self.value} ({self.operator})"
    
    class Meta:
        db_table = 'pv_search_criteria'
        ordering = ['group', 'order']


class PubMedArticle(models.Model):
    """
    Model for storing PubMed articles retrieved from searches
    Uses the existing pubmed_articles table
    """
    pmid = models.CharField(max_length=20, primary_key=True, help_text="PubMed ID (PMID)")
    title = models.TextField(blank=True, null=True, help_text="Article title")
    abstract = models.TextField(blank=True, null=True, help_text="Article abstract")
    publication_date = models.DateField(blank=True, null=True, help_text="Publication date")
    article_link = models.CharField(max_length=255, blank=True, null=True, help_text="URL to the PubMed article")
    doi = models.CharField(max_length=100, blank=True, null=True, help_text="Digital Object Identifier")
    publisher = models.CharField(max_length=100, blank=True, null=True, help_text="Publisher name")
    last_scanned = models.DateTimeField(auto_now=True, help_text="When this article was last scanned")
    is_informational = models.BooleanField(default=False, help_text="Whether this is an informational article")
    
    # Additional fields for the Pharmacovigilance feature
    authors = models.TextField(blank=True, null=True, help_text="JSON list of authors")
    keywords = models.TextField(blank=True, null=True, help_text="Keywords from the article")
    mesh_terms = models.TextField(blank=True, null=True, help_text="MeSH terms")
    
    def __str__(self):
        return self.title or f"Article {self.pmid}"
    
    def get_authors_list(self):
        if self.authors:
            try:
                return json.loads(self.authors)
            except json.JSONDecodeError:
                return []
        return []
    
    def get_keywords_list(self):
        if self.keywords:
            try:
                return json.loads(self.keywords)
            except json.JSONDecodeError:
                return []
        return []
    
    def get_mesh_terms_list(self):
        if self.mesh_terms:
            try:
                return json.loads(self.mesh_terms)
            except json.JSONDecodeError:
                return []
        return []
    
    class Meta:
        db_table = 'pubmed_articles'


class SearchResult(models.Model):
    """
    Model for storing search results linking rules to articles
    """
    search_rule = models.ForeignKey(SearchRule, on_delete=models.CASCADE, related_name='results')
    article = models.ForeignKey(PubMedArticle, on_delete=models.CASCADE, related_name='core_search_results', to_field='pmid')
    found_at = models.DateTimeField(auto_now_add=True, help_text="When this article was found by the search")
    relevance_score = models.FloatField(default=0.0, help_text="Calculated relevance score")
    is_reviewed = models.BooleanField(default=False, help_text="Whether this result has been reviewed")
    notes = models.TextField(blank=True, null=True, help_text="Notes about this result")
    
    def __str__(self):
        return f"{self.search_rule.name} - {self.article.title[:50] if self.article.title else self.article.pmid}"
    
    class Meta:
        db_table = 'pv_search_results'
        unique_together = ('search_rule', 'article')


class AdverseEventTerm(models.Model):
    """
    Model for storing predefined adverse event terms for searches
    """
    term = models.CharField(max_length=255, unique=True, help_text="Adverse event term")
    description = models.TextField(blank=True, null=True, help_text="Description of the term")
    category = models.CharField(max_length=100, blank=True, null=True, help_text="Category of adverse event")
    is_common = models.BooleanField(default=False, help_text="Whether this is a commonly used term")
    
    def __str__(self):
        return self.term
    
    class Meta:
        db_table = 'pv_adverse_event_terms'
        ordering = ['term']
