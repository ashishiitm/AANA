from rest_framework import serializers
from .models import Studies, StudyConditions, StudyLocations

class StudiesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Studies
        fields = [
            'study_id', 
            'nct_id', 
            'official_title', 
            'brief_summary', 
            'overall_status', 
            'study_type'
        ]
        # Optional: Add read_only to avoid accidental updates
        read_only_fields = ['study_id', 'nct_id']

class StudyConditionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyConditions
        fields = ['condition_name']

class StudyLocationsSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyLocations
        fields = [
            'city', 
            'facility_name', 
            'state', 
            'country'
        ]
        # Optional: Add defaults for better serialization
        extra_kwargs = {
            'state': {'default': None},
            'country': {'default': None}
        }
