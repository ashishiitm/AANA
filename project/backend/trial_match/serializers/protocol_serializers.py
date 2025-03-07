from rest_framework import serializers
from django.contrib.auth.models import User
from trial_match.models.protocol import (
    Protocol, ProtocolTeamMember, ProtocolHistory, 
    ProtocolObjective, ProtocolSite
)
from trial_match.serializers.user_serializers import UserSerializer
from trial_match.serializers.site_serializers import SiteSerializer


class ProtocolObjectiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProtocolObjective
        fields = ['id', 'type', 'description', 'endpoints', 'timepoints']


class ProtocolTeamMemberSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = ProtocolTeamMember
        fields = ['id', 'user', 'user_details', 'role', 'permissions']


class ProtocolSiteSerializer(serializers.ModelSerializer):
    site_details = SiteSerializer(source='site', read_only=True)
    
    class Meta:
        model = ProtocolSite
        fields = [
            'id', 'site', 'site_details', 'status', 
            'contact_date', 'confirmation_date', 
            'compatibility_score', 'recruitment_potential',
            'strengths', 'weaknesses'
        ]


class ProtocolHistorySerializer(serializers.ModelSerializer):
    changed_by_details = UserSerializer(source='changed_by', read_only=True)
    
    class Meta:
        model = ProtocolHistory
        fields = ['id', 'version', 'date', 'changed_by', 'changed_by_details', 'changes']


class ProtocolSerializer(serializers.ModelSerializer):
    created_by_details = UserSerializer(source='created_by', read_only=True)
    objectives = ProtocolObjectiveSerializer(many=True, required=False)
    team_members = ProtocolTeamMemberSerializer(many=True, required=False)
    sites = ProtocolSiteSerializer(many=True, required=False)
    history = ProtocolHistorySerializer(many=True, required=False, read_only=True)
    
    class Meta:
        model = Protocol
        fields = [
            'id', 'title', 'version', 'status',
            'molecule_name', 'molecule_description', 'molecule_type',
            'molecule_mechanism', 'molecule_structure',
            'phase', 'therapeutic_area', 'condition',
            'study_design', 'criteria', 'endpoints',
            'company', 'created_by', 'created_by_details',
            'template_used', 'protocol_outline', 'uncertainty_flags',
            'compliance_score', 'compliance_issues',
            'generated_document_url',
            'created_at', 'updated_at',
            'objectives', 'team_members', 'sites', 'history'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def create(self, validated_data):
        objectives_data = validated_data.pop('objectives', [])
        team_members_data = validated_data.pop('team_members', [])
        sites_data = validated_data.pop('sites', [])
        
        # Create the protocol
        protocol = Protocol.objects.create(**validated_data)
        
        # Create the objectives
        for objective_data in objectives_data:
            ProtocolObjective.objects.create(protocol=protocol, **objective_data)
        
        # Create the team members
        for team_member_data in team_members_data:
            ProtocolTeamMember.objects.create(protocol=protocol, **team_member_data)
        
        # Create the sites
        for site_data in sites_data:
            ProtocolSite.objects.create(protocol=protocol, **site_data)
        
        return protocol
    
    def update(self, instance, validated_data):
        objectives_data = validated_data.pop('objectives', None)
        team_members_data = validated_data.pop('team_members', None)
        sites_data = validated_data.pop('sites', None)
        
        # Update the protocol fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Handle objectives if provided
        if objectives_data is not None:
            # Remove existing objectives
            instance.objectives.all().delete()
            
            # Create new objectives
            for objective_data in objectives_data:
                ProtocolObjective.objects.create(protocol=instance, **objective_data)
        
        # Handle team members if provided
        if team_members_data is not None:
            # Remove existing team members
            instance.team_members.all().delete()
            
            # Create new team members
            for team_member_data in team_members_data:
                ProtocolTeamMember.objects.create(protocol=instance, **team_member_data)
        
        # Handle sites if provided
        if sites_data is not None:
            # Remove existing sites
            instance.sites.all().delete()
            
            # Create new sites
            for site_data in sites_data:
                ProtocolSite.objects.create(protocol=instance, **site_data)
        
        # Create a history entry for this update
        ProtocolHistory.objects.create(
            protocol=instance,
            version=instance.version,
            changed_by=self.context['request'].user,
            changes='Protocol updated',
            document_snapshot=self.data
        )
        
        return instance


class ProtocolListSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Protocol
        fields = [
            'id', 'title', 'status', 'molecule_name', 
            'phase', 'therapeutic_area', 'condition',
            'company', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ] 