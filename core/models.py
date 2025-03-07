from django.db import models

class Studies(models.Model):
    study_id = models.IntegerField(primary_key=True)
    nct_id = models.CharField(max_length=11, unique=True)
    official_title = models.TextField(blank=True, null=True)
    brief_summary = models.TextField(blank=True, null=True)
    overall_status = models.CharField(max_length=50, blank=True, null=True)
    study_type = models.CharField(max_length=50, blank=True, null=True)
    primary_purpose = models.CharField(max_length=50, blank=True, null=True)
    allocation = models.CharField(max_length=50, blank=True, null=True)
    interventional_model = models.CharField(max_length=50, blank=True, null=True)
    masking = models.CharField(max_length=50, blank=True, null=True)
    eligibility_criteria = models.TextField(blank=True, null=True)
    ipd_sharing = models.CharField(max_length=20, blank=True, null=True)
    is_fda_regulated_drug = models.BooleanField(null=True)
    is_fda_regulated_device = models.BooleanField(null=True)

    class Meta:
        db_table = 'studies'

    def __str__(self):
        return str(self.study_id)


class StudyFAQs(models.Model):
    faq_id = models.AutoField(primary_key=True)
    study = models.ForeignKey(Studies, on_delete=models.CASCADE, db_column='study_id')
    faqs = models.JSONField()  # Store FAQs as a JSON array
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'study_faqs'


class StudyConditions(models.Model):
    study_id = models.ForeignKey(Studies, on_delete=models.CASCADE, db_column='study_id')
    condition_name = models.TextField()

    class Meta:
        managed = False  # Set to False since the table already exists
        db_table = 'study_conditions'
        unique_together = ('study_id', 'condition_name')

    def __str__(self):
        return self.condition_name


class StudyRecruitmentMessages(models.Model):
    message_id = models.AutoField(primary_key=True)
    study = models.ForeignKey(Studies, on_delete=models.CASCADE, db_column='study_id')
    message = models.TextField()  # Store the recruitment message
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'study_recruitment_messages'


class StudyClassifications(models.Model):
    study = models.ForeignKey(Studies, on_delete=models.CASCADE)
    category = models.CharField(max_length=255)  # Updated
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'study_classifications'

    def __str__(self):
        return f"Classification for Study {self.study_id}: {self.category}"

class StudyLocations(models.Model):
    study_id = models.ForeignKey(Studies, on_delete=models.CASCADE, db_column='study_id')
    facility_name = models.CharField(max_length=1000, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False  # Set to False since the table already exists
        db_table = 'study_locations'

    def __str__(self):
        return f"{self.facility_name}, {self.city}, {self.country}"


# Optional: Create a new model for NLP insights if you prefer a separate table

class StudyNlpInsights(models.Model):
    nlp_insight_id = models.AutoField(primary_key=True)  # Matches schema
    study = models.ForeignKey(Studies, on_delete=models.CASCADE)
    summary = models.TextField()
    simplified_summary = models.TextField(blank=True, null=True)  # Added
    key_entities = models.JSONField()
    eligibility_analysis = models.JSONField()  # Matches schema
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'study_nlp_insights'

    def __str__(self):
        return f"NLP Insights for Study {self.study_id}"

# Add the StudyReports model
class StudyReports(models.Model):
    report_id = models.AutoField(primary_key=True)
    study = models.ForeignKey(Studies, on_delete=models.CASCADE, db_column='study_id')
    report = models.JSONField()  # Store the generated report as JSON
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp for when the report was generated

    class Meta:
        db_table = 'study_reports'

    def __str__(self):
        return f"Report for Study {self.study.study_id}"

# Add missing models referenced in views.py
class StudySponsors(models.Model):
    sponsor_id = models.AutoField(primary_key=True)
    study_id = models.ForeignKey(Studies, on_delete=models.CASCADE, db_column='study_id')
    sponsor_name = models.CharField(max_length=255)
    sponsor_type = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = 'study_sponsors'

    def __str__(self):
        return self.sponsor_name

class StudyContacts(models.Model):
    contact_id = models.AutoField(primary_key=True)
    study_id = models.ForeignKey(Studies, on_delete=models.CASCADE, db_column='study_id')
    contact_name = models.CharField(max_length=255)
    role = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        db_table = 'study_contacts'

    def __str__(self):
        return self.contact_name

class StudyPrimaryOutcomes(models.Model):
    outcome_id = models.AutoField(primary_key=True)
    study_id = models.ForeignKey(Studies, on_delete=models.CASCADE, db_column='study_id')
    measure = models.TextField()
    description = models.TextField(blank=True, null=True)
    time_frame = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = 'study_primary_outcomes'

    def __str__(self):
        return f"Primary Outcome for Study {self.study_id}"

class StudySecondaryOutcomes(models.Model):
    outcome_id = models.AutoField(primary_key=True)
    study_id = models.ForeignKey(Studies, on_delete=models.CASCADE, db_column='study_id')
    measure = models.TextField()
    description = models.TextField(blank=True, null=True)
    time_frame = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = 'study_secondary_outcomes'

    def __str__(self):
        return f"Secondary Outcome for Study {self.study_id}"

class StudyInvestigators(models.Model):
    investigator_id = models.AutoField(primary_key=True)
    study_id = models.ForeignKey(Studies, on_delete=models.CASCADE, db_column='study_id')
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=100, blank=True, null=True)
    affiliation = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = 'study_investigators'

    def __str__(self):
        return self.name

class StudyCollaborators(models.Model):
    collaborator_id = models.AutoField(primary_key=True)
    study_id = models.ForeignKey(Studies, on_delete=models.CASCADE, db_column='study_id')
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = 'study_collaborators'

    def __str__(self):
        return self.name

class StudyDates(models.Model):
    date_id = models.AutoField(primary_key=True)
    study_id = models.ForeignKey(Studies, on_delete=models.CASCADE, db_column='study_id')
    date_type = models.CharField(max_length=100)  # e.g., 'start_date', 'completion_date'
    date_value = models.DateField(blank=True, null=True)

    class Meta:
        db_table = 'study_dates'

    def __str__(self):
        return f"{self.date_type} for Study {self.study_id}"