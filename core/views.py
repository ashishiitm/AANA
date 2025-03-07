from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
from .models import Studies, StudyConditions, StudyLocations, StudySponsors, StudyContacts, StudyPrimaryOutcomes, StudySecondaryOutcomes, StudyInvestigators, StudyCollaborators, StudyDates, StudyNlpInsights
from .serializers import StudiesSerializer, StudyConditionsSerializer, StudyLocationsSerializer
from django.http import JsonResponse
from django.db.models import Count, Avg, Sum, F
from django.utils import timezone
from datetime import timedelta
import json

def home(request):
    return render(request, 'home.html')  # Updated path
    
class PlatformTrialViewSet(viewsets.ModelViewSet):
    queryset = Studies.objects.all()
    serializer_class = StudiesSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(pharma_company=self.request.user.userprofile.pharma_company)

@api_view(['GET'])
def get_active_trials(request):
    """
    API endpoint that returns active and recruiting clinical trials.
    """
    try:
        # Return mock data for testing
        mock_data = [
            {
                'study_id': 'NCT01234567',
                'official_title': 'A Phase 3 Study of New Drug for Diabetes Treatment',
                'overall_status': 'RECRUITING',
                'condition': 'Type 2 Diabetes',
                'location': 'Boston, MA',
                'brief_summary': 'This study evaluates the efficacy and safety of a new drug for treating type 2 diabetes in adults.',
                'phase': 'Phase 3',
                'enrollment': 450,
                'start_date': '2023-01-15',
                'primary_completion_date': '2024-06-30',
                'eligibility_criteria': 'Adults 18-75 with Type 2 Diabetes; HbA1c between 7.0% and 10.0%',
                'sponsor': 'Novartis Pharmaceuticals',
                'contact_name': 'Dr. Sarah Johnson',
                'contact_email': 'sarah.johnson@example.com',
                'contact_phone': '(617) 555-1234'
            },
            {
                'study_id': 'NCT02345678',
                'official_title': 'Evaluation of Immunotherapy in Advanced Lung Cancer',
                'overall_status': 'ACTIVE',
                'condition': 'Lung Cancer',
                'location': 'New York, NY',
                'brief_summary': 'This trial studies how well immunotherapy works in treating patients with advanced lung cancer.',
                'phase': 'Phase 2',
                'enrollment': 320,
                'start_date': '2022-11-05',
                'primary_completion_date': '2024-04-15',
                'eligibility_criteria': 'Adults with stage III or IV lung cancer; ECOG performance status 0-1',
                'sponsor': 'Memorial Sloan Kettering Cancer Center',
                'contact_name': 'Dr. Michael Chen',
                'contact_email': 'michael.chen@example.com',
                'contact_phone': '(212) 555-6789'
            },
            {
                'study_id': 'NCT03456789',
                'official_title': 'Novel Treatment Approach for Alzheimer\'s Disease',
                'overall_status': 'RECRUITING',
                'condition': 'Alzheimer\'s Disease',
                'location': 'San Francisco, CA',
                'brief_summary': 'This study tests a new approach to treating early-stage Alzheimer\'s disease.',
                'phase': 'Phase 2/3',
                'enrollment': 580,
                'start_date': '2023-02-20',
                'primary_completion_date': '2025-03-15',
                'eligibility_criteria': 'Adults 50-85 with mild cognitive impairment or early Alzheimer\'s disease',
                'sponsor': 'University of California, San Francisco',
                'contact_name': 'Dr. Robert Williams',
                'contact_email': 'robert.williams@example.com',
                'contact_phone': '(415) 555-4321'
            }
        ]
        
        return Response(mock_data)
    
    except Exception as e:
        print(f"Error in get_active_trials: {str(e)}")
        # Return a simplified response with error information
        return Response({
            'error': str(e)
        }, status=500)

def get_faqs(request, study_id):
    faqs = StudyFAQs.objects.filter(study_id=study_id).first()
    return JsonResponse({"faqs": faqs.faqs if faqs else []})

def get_recruitment_message(request, study_id):
    message = StudyRecruitmentMessages.objects.filter(study_id=study_id).first()
    return JsonResponse({"message": message.message if message else ""})

def get_classification(request, study_id):
    classification = StudyClassifications.objects.filter(study_id=study_id).first()
    return JsonResponse({"category": classification.category if classification else ""})

def get_report(request, study_id):
    report = StudyReports.objects.filter(study_id=study_id).first()
    return JsonResponse({"report": report.report if report else ""})
    
@api_view(['GET'])
def get_conditions(request):
    conditions = StudyConditions.objects.values_list('condition_name', flat=True).distinct()
    return Response(list(conditions))  # Convert QuerySet to list for JSON serialization

@api_view(['GET'])
def get_locations(request):
    locations = StudyLocations.objects.values_list('city', flat=True).distinct()
    return Response(list(locations))

@api_view(['GET'])
def get_phases(request):
    phases = Studies.objects.values_list('study_type', flat=True).distinct()
    return Response(list(phases))

@api_view(['GET'])
def get_database_stats(request):
    """
    API endpoint that returns statistics about the clinical trials database.
    """
    try:
        view_mode = request.query_params.get('viewMode', 'patient')
        time_range = request.query_params.get('timeRange', 'all')
        
        # Return mock data for testing
        mock_data = {
            'totalTrials': 234505,
            'recruitingTrials': 42389,
            'completedTrials': 156782,
            'suspendedTrials': 3521,
            'participantsEnrolled': 12567890,
            'topConditions': [
                {'name': 'Diabetes', 'count': 12453},
                {'name': 'Cancer', 'count': 10234},
                {'name': 'Hypertension', 'count': 8765},
                {'name': 'Alzheimer\'s Disease', 'count': 5432},
                {'name': 'Depression', 'count': 4321}
            ],
            'topLocations': [
                {'name': 'New York, NY', 'count': 8765},
                {'name': 'Boston, MA', 'count': 7654},
                {'name': 'Los Angeles, CA', 'count': 6543},
                {'name': 'Chicago, IL', 'count': 5432},
                {'name': 'Houston, TX', 'count': 4321}
            ],
            'lastUpdated': '2023-03-02T12:00:00Z'
        }
        
        # Add view-specific data
        if view_mode == 'pharma':
            mock_data.update({
                'enrollmentRate': '78%',
                'retentionRate': '92%',
                'avgCompletionTime': '14 months',
                'costPerPatient': '$12,450',
                'topPerformingDoctors': [
                    {'name': 'Dr. Sarah Johnson', 'trials': 24, 'patients': 342},
                    {'name': 'Dr. Michael Chen', 'trials': 18, 'patients': 287},
                    {'name': 'Dr. Emily Rodriguez', 'trials': 15, 'patients': 256}
                ]
            })
        else:  # patient mode
            mock_data.update({
                'nearbyTrials': 156,
                'matchingTrials': 42,
                'eligibilityRate': '68%',
                'patientSatisfaction': '4.7/5',
                'demographics': {
                    'age': {'18-30': 15, '31-45': 25, '46-60': 35, '61+': 25},
                    'gender': {'Male': 48, 'Female': 52},
                    'ethnicity': {'Caucasian': 65, 'African American': 15, 'Hispanic': 12, 'Asian': 8}
                }
            })
        
        return Response(mock_data)
    
    except Exception as e:
        print(f"Error in get_database_stats: {str(e)}")
        # Return a simplified response with error information
        return Response({
            'error': str(e),
            'totalTrials': 234505,
            'recruitingTrials': 42389,
            'completedTrials': 156782
        }, status=500)

@api_view(['GET'])
def get_featured_studies(request):
    """
    API endpoint that returns featured clinical trials.
    """
    try:
        # Return mock data for testing
        mock_data = [
            {
                'study_id': 'NCT09876543',
                'official_title': 'Innovative Treatment for Rheumatoid Arthritis',
                'overall_status': 'RECRUITING',
                'condition': 'Rheumatoid Arthritis',
                'location': 'Seattle, WA',
                'brief_summary': 'This study evaluates a novel biologic therapy for moderate to severe rheumatoid arthritis.'
            },
            {
                'study_id': 'NCT08765432',
                'official_title': 'Breakthrough Therapy for Multiple Sclerosis',
                'overall_status': 'RECRUITING',
                'condition': 'Multiple Sclerosis',
                'location': 'Rochester, MN',
                'brief_summary': 'This trial investigates a new approach to treating relapsing-remitting multiple sclerosis.'
            },
            {
                'study_id': 'NCT07654321',
                'official_title': 'Advanced Treatment for Parkinson\'s Disease',
                'overall_status': 'RECRUITING',
                'condition': 'Parkinson\'s Disease',
                'location': 'Philadelphia, PA',
                'brief_summary': 'This study tests a novel gene therapy approach for early-stage Parkinson\'s disease.'
            }
        ]
        
        return Response(mock_data)
    
    except Exception as e:
        print(f"Error in get_featured_studies: {str(e)}")
        # Return a simplified response with error information
        return Response({
            'error': str(e)
        }, status=500)

@api_view(['GET'])
def get_study_details(request, study_id):
    """
    Retrieve detailed information about a specific study.
    """
    try:
        # Get the main study information
        study = Studies.objects.get(study_id=study_id)
        
        # Get related information
        sponsors = StudySponsors.objects.filter(study_id=study_id)
        locations = StudyLocations.objects.filter(study_id=study_id)
        contacts = StudyContacts.objects.filter(study_id=study_id)
        conditions = StudyConditions.objects.filter(study_id=study_id)
        primary_outcomes = StudyPrimaryOutcomes.objects.filter(study_id=study_id)
        secondary_outcomes = StudySecondaryOutcomes.objects.filter(study_id=study_id)
        investigators = StudyInvestigators.objects.filter(study_id=study_id)
        collaborators = StudyCollaborators.objects.filter(study_id=study_id)
        dates = StudyDates.objects.filter(study_id=study_id)
        
        # Try to get NLP insights if available
        try:
            nlp_insights = StudyNlpInsights.objects.get(study_id=study_id)
            simplified_summary = nlp_insights.simplified_summary
            eligibility_analysis = nlp_insights.eligibility_analysis
        except StudyNlpInsights.DoesNotExist:
            simplified_summary = None
            eligibility_analysis = None
        
        # Format dates into a dictionary
        formatted_dates = {}
        for date in dates:
            formatted_dates[date.date_type] = date.date_value.isoformat() if date.date_value else None
        
        # Construct the response
        response_data = {
            'study_id': study.study_id,
            'nct_id': study.nct_id,
            'official_title': study.official_title,
            'brief_summary': study.brief_summary,
            'overall_status': study.overall_status,
            'study_type': study.study_type,
            'primary_purpose': study.primary_purpose,
            'allocation': study.allocation,
            'interventional_model': study.interventional_model,
            'masking': study.masking,
            'eligibility_criteria': study.eligibility_criteria,
            'simplified_summary': simplified_summary,
            'eligibility_analysis': eligibility_analysis,
            'sponsors': [
                {
                    'name': sponsor.sponsor_name,
                    'type': sponsor.sponsor_type
                } for sponsor in sponsors
            ],
            'locations': [
                {
                    'facility_name': location.facility_name,
                    'city': location.city,
                    'state': location.state,
                    'country': location.country
                } for location in locations
            ],
            'contacts': [
                {
                    'name': contact.contact_name,
                    'role': contact.role,
                    'phone': contact.phone,
                    'email': contact.email
                } for contact in contacts
            ],
            'conditions': [condition.condition_name for condition in conditions],
            'primary_outcomes': [
                {
                    'measure': outcome.measure,
                    'description': outcome.description,
                    'time_frame': outcome.time_frame
                } for outcome in primary_outcomes
            ],
            'secondary_outcomes': [
                {
                    'measure': outcome.measure,
                    'description': outcome.description,
                    'time_frame': outcome.time_frame
                } for outcome in secondary_outcomes
            ],
            'investigators': [
                {
                    'name': investigator.investigator_name,
                    'role': investigator.role,
                    'affiliation': investigator.affiliation
                } for investigator in investigators
            ],
            'collaborators': [
                {
                    'name': collaborator.collaborator_name,
                    'class': collaborator.collaborator_class
                } for collaborator in collaborators
            ],
            'dates': formatted_dates
        }
        
        return Response(response_data)
    
    except Studies.DoesNotExist:
        return Response({'error': 'Study not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
def get_doctor_by_license(request):
    try:
        license_state = request.GET.get('state', '').strip().upper()
        license_number = request.GET.get('number', '').strip().zfill(10)  # Pad with zeros to match database format if needed

        if not license_state or not license_number:
            return JsonResponse({
                'error': 'License state and number are required'
            }, status=400)

        logger.info(f"Searching for doctor with license {license_number} in state {license_state}")

        # Query the database with case-insensitive matching for license_state
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    d.doctor_id, 
                    d.first_name, 
                    d.last_name, 
                    d.email, 
                    d.phone, 
                    d.specialty_description, 
                    d.years_experience,
                    l.address_line1,
                    l.address_line2,
                    l.city,
                    l.state,
                    l.zip_code
                FROM 
                    doctors d
                LEFT JOIN 
                    locations l ON d.doctor_id = l.doctor_id AND l.is_primary = true
                WHERE 
                    d.license_state ILIKE %s AND d.license_number = %s
                LIMIT 1
            """, [license_state, license_number])

            row = cursor.fetchone()

            if row:
                # Get doctor degrees
                cursor.execute("""
                    SELECT 
                        deg.name, 
                        dd.awarded_date, 
                        dd.institution
                    FROM 
                        doctor_degrees dd
                    JOIN 
                        degrees deg ON dd.degree_id = deg.degree_id
                    WHERE 
                        dd.doctor_id = %s
                """, [row[0]])

                degrees = []
                for degree_row in cursor.fetchall():
                    degrees.append({
                        'name': degree_row[0],
                        'awarded_date': degree_row[1],
                        'institution': degree_row[2]
                    })

                doctor_data = {
                    'doctor_id': row[0],
                    'first_name': row[1],
                    'last_name': row[2],
                    'email': row[3],
                    'phone': row[4],
                    'specialty_description': row[5],
                    'years_experience': row[6],
                    'address': {
                        'address_line1': row[7] or '',
                        'address_line2': row[8] or '',
                        'city': row[9] or '',
                        'state': row[10] or '',
                        'zip_code': row[11] or ''
                    },
                    'degrees': degrees
                }

                logger.info(f"Found doctor: {row[1]} {row[2]}")
                return JsonResponse(doctor_data)

            else:
                logger.info(f"No doctor found with license {license_number} in state {license_state}")
                return JsonResponse({
                    'message': 'No doctor found with the provided license information'
                }, status=404)

    except Exception as e:
        logger.exception(f"Error fetching doctor by license: {str(e)}")
        return JsonResponse({
            'error': 'An error occurred while fetching doctor information'
        }, status=500)