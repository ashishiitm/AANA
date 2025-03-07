from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.shortcuts import get_object_or_404
from trial_match.models.protocol import Protocol, ProtocolSite
from trial_match.models.site import Site
from trial_match.serializers.protocol_serializers import (
    ProtocolSerializer, ProtocolListSerializer
)
from trial_match.permissions import IsOwnerOrTeamMember


class ProtocolViewSet(viewsets.ModelViewSet):
    """
    API endpoint for protocols
    """
    queryset = Protocol.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrTeamMember]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'molecule_name', 'therapeutic_area', 'condition', 'company']
    ordering_fields = ['created_at', 'updated_at', 'title']
    ordering = ['-updated_at']  # Default ordering
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProtocolListSerializer
        return ProtocolSerializer
    
    def get_queryset(self):
        """
        Filter protocols based on user's access
        """
        user = self.request.user
        
        # Filter by created_by or team_member
        queryset = Protocol.objects.filter(
            Q(created_by=user) | Q(team_members__user=user)
        ).distinct()
        
        # Apply additional filters from query params
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        company_filter = self.request.query_params.get('company')
        if company_filter:
            queryset = queryset.filter(company=company_filter)
        
        therapeutic_area_filter = self.request.query_params.get('therapeutic_area')
        if therapeutic_area_filter:
            queryset = queryset.filter(therapeutic_area=therapeutic_area_filter)
        
        phase_filter = self.request.query_params.get('phase')
        if phase_filter:
            queryset = queryset.filter(phase=phase_filter)
        
        return queryset
    
    def perform_create(self, serializer):
        """
        Set the created_by field to the current user
        """
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def compliance_check(self, request, pk=None):
        """
        Run compliance check on a protocol
        """
        protocol = self.get_object()
        
        # In a real implementation, this would call an AI service
        # For now, simulate with sample data
        import random
        
        compliance_score = random.randint(70, 100)
        compliance_issues = []
        
        if compliance_score < 95:
            # Generate some sample issues
            categories = ['ethics', 'scientific', 'regulatory', 'procedural', 'statistical', 'operational']
            severities = ['high', 'medium', 'low']
            locations = ['Introduction', 'Objectives', 'Study Design', 'Endpoints', 'Statistical Analysis']
            
            # Generate 1-5 random issues
            issue_count = random.randint(1, 5)
            
            for i in range(issue_count):
                compliance_issues.append({
                    'category': random.choice(categories),
                    'description': f'Sample compliance issue {i+1}',
                    'severity': random.choice(severities),
                    'location': random.choice(locations),
                    'status': 'open'
                })
        
        # Update protocol with compliance data
        protocol.compliance_score = compliance_score
        protocol.compliance_issues = compliance_issues
        protocol.save()
        
        return Response({
            'compliance_score': compliance_score,
            'compliance_issues': compliance_issues
        })
    
    @action(detail=True, methods=['post'])
    def site_matching(self, request, pk=None):
        """
        Find matching sites for a protocol
        """
        protocol = self.get_object()
        
        # Query sites that match therapeutic area
        sites = Site.objects.filter(
            Q(therapeutic_experience__area=protocol.therapeutic_area) & 
            Q(is_active=True)
        ).distinct()[:20]  # Limit to 20 sites
        
        # For each site, calculate compatibility
        matched_sites = []
        
        for site in sites:
            # In a real implementation, this would use more complex logic
            # For demo, use a simplified scoring approach
            strengths = []
            weaknesses = []
            
            # Check therapeutic area experience
            therapeutic_experience = site.therapeutic_experience.filter(
                area=protocol.therapeutic_area
            ).first()
            
            if therapeutic_experience:
                strengths.append(f"Experience in {protocol.therapeutic_area}")
            else:
                weaknesses.append(f"Limited experience in {protocol.therapeutic_area}")
            
            # Check phase experience
            phase_field = f"phase{protocol.phase.lower().replace(' ', '')}_count"
            
            try:
                if hasattr(site, 'trial_experience') and getattr(site.trial_experience, phase_field, 0) > 3:
                    strengths.append(f"Strong {protocol.phase} experience")
                else:
                    weaknesses.append(f"Limited {protocol.phase} experience")
            except AttributeError:
                weaknesses.append(f"Limited {protocol.phase} experience")
            
            # Calculate compatibility score (simplified)
            base_score = 3.0  # baseline score
            score = base_score + (len(strengths) * 0.5) - (len(weaknesses) * 0.3)
            
            # Ensure score is within bounds (1-5)
            score = max(1.0, min(5.0, score))
            
            # For demo purposes, generate a random recruitment potential
            recruitment_potential = random.randint(20, 100)
            
            # Save this score to the database
            protocol_site, created = ProtocolSite.objects.get_or_create(
                protocol=protocol,
                site=site,
                defaults={
                    'status': 'selected',
                    'compatibility_score': score,
                    'strengths': strengths,
                    'weaknesses': weaknesses,
                    'recruitment_potential': recruitment_potential
                }
            )
            
            # If not created, update the existing record
            if not created:
                protocol_site.compatibility_score = score
                protocol_site.strengths = strengths
                protocol_site.weaknesses = weaknesses
                protocol_site.recruitment_potential = recruitment_potential
                protocol_site.save()
            
            # Get the primary location for the site
            location = site.locations.filter(is_primary=True).first()
            
            # Add to results
            matched_sites.append({
                'id': site.id,
                'doctor_id': getattr(site, 'doctor_id', str(site.id)),
                'first_name': getattr(site, 'first_name', ''),
                'last_name': getattr(site, 'last_name', ''),
                'specialty_description': getattr(site, 'specialty_description', ''),
                'email': getattr(site, 'email', ''),
                'location': {
                    'city': location.city if location else '',
                    'state': location.state if location else '',
                    'latitude': location.latitude if location else None,
                    'longitude': location.longitude if location else None
                } if location else None,
                'compatibility': {
                    'score': score,
                    'strengths': strengths,
                    'weaknesses': weaknesses
                },
                'recruitment_potential': recruitment_potential
            })
        
        # Sort by compatibility score
        matched_sites.sort(key=lambda x: x['compatibility']['score'], reverse=True)
        
        return Response(matched_sites)
    
    @action(detail=True, methods=['post'])
    def generate_pdf(self, request, pk=None):
        """
        Generate PDF for a protocol
        """
        protocol = self.get_object()
        
        # In a real implementation, this would generate a PDF document
        # For demo, set a placeholder URL
        document_url = f"/api/protocols/{protocol.id}/download-pdf"
        
        # Update the protocol with the document URL
        protocol.generated_document_url = document_url
        protocol.save()
        
        return Response({'url': document_url}) 