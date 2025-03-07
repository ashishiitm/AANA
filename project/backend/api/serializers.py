from rest_framework import serializers
from .models import Studies, AdverseEventTerm
from core.models import (
    StudyEnrollmentRequest, Doctor,
    SearchRule, SearchCriterion, PubMedArticle, SearchResult
)
import json

# Existing serializers
class StudiesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Studies
        # Explicitly list fields to exclude related models
        fields = [
            'study_id', 'nct_id', 'official_title', 'brief_summary', 'overall_status',
            'study_type', 'primary_purpose', 'allocation', 'interventional_model',
            'masking', 'eligibility_criteria', 'ipd_sharing', 'is_fda_regulated_drug',
            'is_fda_regulated_device', 'completion_date', 'location', 'sponsor', 'start_date'
        ]

class StudyEnrollmentRequestSerializer(serializers.ModelSerializer):
    study = serializers.DictField(required=False)
    patient_name = serializers.CharField(required=False)
    patient_email = serializers.EmailField(required=False)
    patient_phone = serializers.CharField(required=False)
    doctor_name = serializers.CharField(required=False)
    doctor_email = serializers.EmailField(required=False)
    doctor_phone = serializers.CharField(required=False)
    doctor_license = serializers.CharField(required=False)
    notes = serializers.CharField(required=False)
    status = serializers.CharField(required=False)
    created_at = serializers.DateTimeField(required=False)
    updated_at = serializers.DateTimeField(required=False)
    
    class Meta:
        model = StudyEnrollmentRequest
        fields = [
            'id', 'study', 'patient_name', 'patient_email', 'patient_phone',
            'doctor_name', 'doctor_email', 'doctor_phone', 'doctor_license',
            'notes', 'status', 'created_at', 'updated_at'
        ]
        
    def to_representation(self, instance):
        """
        Handle both model instances and dictionaries (for mock data)
        """
        if isinstance(instance, dict):
            return instance
        return super().to_representation(instance)

# Pharmacovigilance serializers
class SearchCriterionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchCriterion
        fields = '__all__'

class SearchRuleSerializer(serializers.ModelSerializer):
    criteria = SearchCriterionSerializer(many=True, read_only=True)
    
    class Meta:
        model = SearchRule
        fields = '__all__'
        
    def create(self, validated_data):
        criteria_data = self.context['request'].data.get('criteria', [])
        search_rule = SearchRule.objects.create(**validated_data)
        
        for criterion_data in criteria_data:
            criterion_data['search_rule'] = search_rule.id
            criterion_serializer = SearchCriterionSerializer(data=criterion_data)
            if criterion_serializer.is_valid():
                criterion_serializer.save()
                
        return search_rule
    
    def update(self, instance, validated_data):
        criteria_data = self.context['request'].data.get('criteria', [])
        
        # Update the search rule
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Handle criteria updates if provided
        if criteria_data:
            # Remove existing criteria
            instance.criteria.all().delete()
            
            # Create new criteria
            for criterion_data in criteria_data:
                criterion_data['search_rule'] = instance.id
                criterion_serializer = SearchCriterionSerializer(data=criterion_data)
                if criterion_serializer.is_valid():
                    criterion_serializer.save()
                    
        return instance

class PubMedArticleSerializer(serializers.ModelSerializer):
    authors_list = serializers.SerializerMethodField()
    keywords_list = serializers.SerializerMethodField()
    mesh_terms_list = serializers.SerializerMethodField()
    
    class Meta:
        model = PubMedArticle
        fields = '__all__'
        
    def get_authors_list(self, obj):
        return obj.get_authors_list()
    
    def get_keywords_list(self, obj):
        return obj.get_keywords_list()
    
    def get_mesh_terms_list(self, obj):
        return obj.get_mesh_terms_list()
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Remove the raw JSON fields from the representation
        representation.pop('authors', None)
        representation.pop('keywords', None)
        representation.pop('mesh_terms', None)
        return representation
    
    def create(self, validated_data):
        # Convert list fields to JSON strings
        authors = self.initial_data.get('authors_list', [])
        keywords = self.initial_data.get('keywords_list', [])
        mesh_terms = self.initial_data.get('mesh_terms_list', [])
        
        if authors:
            validated_data['authors'] = json.dumps(authors)
        if keywords:
            validated_data['keywords'] = json.dumps(keywords)
        if mesh_terms:
            validated_data['mesh_terms'] = json.dumps(mesh_terms)
            
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Convert list fields to JSON strings
        authors = self.initial_data.get('authors_list', None)
        keywords = self.initial_data.get('keywords_list', None)
        mesh_terms = self.initial_data.get('mesh_terms_list', None)
        
        if authors is not None:
            validated_data['authors'] = json.dumps(authors)
        if keywords is not None:
            validated_data['keywords'] = json.dumps(keywords)
        if mesh_terms is not None:
            validated_data['mesh_terms'] = json.dumps(mesh_terms)
            
        return super().update(instance, validated_data)

class SearchResultSerializer(serializers.ModelSerializer):
    article_details = PubMedArticleSerializer(source='article', read_only=True)
    
    class Meta:
        model = SearchResult
        fields = '__all__'

class AdverseEventTermSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdverseEventTerm
        fields = '__all__'

class AdverseEventTermSimpleSerializer(serializers.ModelSerializer):
    """A simplified serializer for AdverseEventTerm to use in nested contexts"""
    class Meta:
        model = AdverseEventTerm
        fields = ['id', 'term', 'category']

class SearchResultSimpleSerializer(serializers.ModelSerializer):
    """A simplified serializer for SearchResult to use in list views"""
    article_title = serializers.CharField(source='article.title', read_only=True)
    article_pmid = serializers.CharField(source='article.pmid', read_only=True)
    article_date = serializers.DateField(source='article.publication_date', read_only=True)
    
    class Meta:
        model = SearchResult
        fields = [
            'id', 'article_title', 'article_pmid', 'article_date',
            'matched_terms', 'review_status', 'reviewed_at'
        ]

class MarkReviewedSerializer(serializers.Serializer):
    notes = serializers.CharField(required=False, allow_blank=True) 