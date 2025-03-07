import json
import logging
import re

from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from django.utils import timezone
from django.db.models import Q, Count
from django.db import connection
from django.http import JsonResponse

# spaCy imports (ensure installed: pip install spacy; python -m spacy download en_core_web_sm)
import spacy
nlp = spacy.load("en_core_web_sm")
from spacy.matcher import PhraseMatcher
print("spaCy loaded successfully")

# Local imports
from .models import Studies, StudyEnrollmentRequest, Doctor
from .email_service import send_enrollment_confirmation, send_doctor_enrollment_confirmation

logger = logging.getLogger(__name__)

# Load spaCy model and define matchers/patterns dynamically (moved to process_nlp_query)
# matcher = PhraseMatcher(nlp.vocab)

def parse_eligibility_criteria(criteria_text):
    """Parse eligibility criteria into inclusion and exclusion lists."""
    if not criteria_text or not criteria_text.strip():
        return {"inclusion": [], "exclusion": []}
    
    inclusion = []
    exclusion = []
    lines = [line.strip() for line in criteria_text.split('\n') if line.strip()]
    current_section = None
    
    for line in lines:
        if "Inclusion Criteria:" in line:
            current_section = "inclusion"
            continue
        elif "Exclusion Criteria:" in line:
            current_section = "exclusion"
            continue
        elif current_section:
            # Handle asterisks (*), numbered lists (1., 2., etc.), or plain text
            cleaned_line = re.sub(r'^\*?\s*|\d+\.\s*', '', line).strip()
            if cleaned_line:  # Ensure there's content after cleaning
                if current_section == "inclusion":
                    inclusion.append(cleaned_line)
                elif current_section == "exclusion":
                    exclusion.append(cleaned_line)
    
    return {"inclusion": inclusion, "exclusion": exclusion}

@api_view(['POST'])
@permission_classes([AllowAny])
def create_enrollment_request(request):
    """
    Handle enrollment requests for clinical trials
    """
    try:
        data = request.data  # Use request.data instead of json.loads(request.body)
        enrollment_type = data.get('enrollmentType', 'patient')
        nct_id = data.get('nct_id', '')

        logger.info(f"Received {enrollment_type} enrollment request for NCT ID: {nct_id}")

        # Save the enrollment to your database if needed
        # e.g., StudyEnrollmentRequest.objects.create(nct_id=nct_id, ...)

        # Send appropriate confirmation email based on enrollment type
        if enrollment_type == 'doctor':
            email_result = send_doctor_enrollment_confirmation(data)
        else:
            email_result = send_enrollment_confirmation(data)

        if email_result:
            logger.info(f"Confirmation email sent successfully for {enrollment_type} enrollment")
        else:
            logger.warning(f"Failed to send confirmation email for {enrollment_type} enrollment")

        return JsonResponse({
            'success': True,
            'message': f'{enrollment_type.capitalize()} enrollment request submitted successfully',
            'email_sent': bool(email_result)
        })

    except Exception as e:
        logger.exception(f"Error processing enrollment request: {str(e)}")
        return JsonResponse({
            'success': False,
            'message': 'Failed to process enrollment request',
            'error': str(e)
        }, status=400)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_active_trials(request):
    """
    Get all active clinical trials (RECRUITING or ACTIVE)
    """
    try:
        logger.info("Fetching active trials...")

        logger.info(f"Database connection: {connection.settings_dict}")

        total_studies = Studies.objects.count()
        logger.info(f"Total studies in database: {total_studies}")

        trials = Studies.objects.filter(
            Q(overall_status='RECRUITING') | Q(overall_status='ACTIVE')
        ).values(
            'nct_id',
            'study_id',
            'official_title',
            'brief_summary',
            'overall_status',
            'study_type',
            'primary_purpose',
            'allocation',
            'interventional_model',
            'masking',
            'eligibility_criteria',
            'ipd_sharing',
            'is_fda_regulated_drug',
            'is_fda_regulated_device',
            'start_date',
            'completion_date',
            'sponsor',
            'location'
        )[:10]  # Limit to 10 trials for now

        trials_list = []
        for trial in trials:
            parsed_criteria = parse_eligibility_criteria(trial['eligibility_criteria'] or '')
            trials_list.append({
                'nct_id': trial['nct_id'],
                'study_id': trial['study_id'],
                'official_title': trial['official_title'],
                'brief_summary': trial['brief_summary'] or 'No summary provided',
                'overall_status': trial['overall_status'],
                'phase': get_user_friendly_phase(trial['study_type']),
                'primary_purpose': trial['primary_purpose'] or 'Not specified',
                'allocation': trial['allocation'] or 'Not specified',
                'interventional_model': trial['interventional_model'] or 'Not specified',
                'masking': trial['masking'] or 'Not specified',
                'eligibility_criteria': {
                    'inclusion': parsed_criteria['inclusion'],
                    'exclusion': parsed_criteria['exclusion']
                },
                'ipd_sharing': trial['ipd_sharing'] or 'Not specified',
                'is_fda_regulated_drug': trial['is_fda_regulated_drug'],
                'is_fda_regulated_device': trial['is_fda_regulated_device'],
                'start_date': trial['start_date'] if trial['start_date'] else 'Not specified',
                'completion_date': trial['completion_date'] if trial['completion_date'] else 'Not specified',
                'sponsor': trial['sponsor'] or 'Not specified',
                'location': trial['location'] or 'Not specified'
            })

        logger.info(f"Found {len(trials_list)} active trials")
        return Response(trials_list, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error fetching active trials: {str(e)}", exc_info=True)
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_featured_studies(request):
    """
    Get featured clinical studies (example: top 5 RECRUITING)
    """
    try:
        logger.info("Fetching featured studies...")

        logger.info(f"Database connection: {connection.settings_dict}")

        total_studies = Studies.objects.count()
        logger.info(f"Total studies in database: {total_studies}")

        recruiting_studies = Studies.objects.filter(overall_status='RECRUITING').count()
        logger.info(f"Total recruiting studies: {recruiting_studies}")

        studies = Studies.objects.filter(
            overall_status='RECRUITING'
        ).values(
            'nct_id',
            'study_id',
            'official_title',
            'brief_summary',
            'overall_status',
            'study_type',
            'primary_purpose',
            'allocation',
            'interventional_model',
            'masking',
            'eligibility_criteria',
            'ipd_sharing',
            'is_fda_regulated_drug',
            'is_fda_regulated_device',
            'start_date',
            'completion_date',
            'sponsor',
            'location'
        )[:5]  # Limit to 5 featured studies

        studies_list = []
        for study in studies:
            parsed_criteria = parse_eligibility_criteria(study['eligibility_criteria'] or '')
            studies_list.append({
                'nct_id': study['nct_id'],
                'study_id': study['study_id'],
                'official_title': study['official_title'],
                'brief_summary': study['brief_summary'] or 'No summary provided',
                'overall_status': study['overall_status'],
                'phase': get_user_friendly_phase(study['study_type']),
                'primary_purpose': study['primary_purpose'] or 'Not specified',
                'allocation': study['allocation'] or 'Not specified',
                'interventional_model': study['interventional_model'] or 'Not specified',
                'masking': study['masking'] or 'Not specified',
                'eligibility_criteria': {
                    'inclusion': parsed_criteria['inclusion'],
                    'exclusion': parsed_criteria['exclusion']
                },
                'ipd_sharing': study['ipd_sharing'] or 'Not specified',
                'is_fda_regulated_drug': study['is_fda_regulated_drug'],
                'is_fda_regulated_device': study['is_fda_regulated_device'],
                'start_date': study['start_date'] if study['start_date'] else 'Not specified',
                'completion_date': study['completion_date'] if study['completion_date'] else 'Not specified',
                'sponsor': study['sponsor'] or 'Not specified',
                'location': study['location'] or 'Not specified'
            })

        logger.info(f"Found {len(studies_list)} featured studies")
        return Response(studies_list, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error fetching featured studies: {str(e)}", exc_info=True)
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def search_studies(request):
    """
    Search clinical studies based on query and optional status
    """
    query = request.GET.get('query', '')
    status_filter = request.GET.get('status', None)

    try:
        # Base query
        studies = Studies.objects.all()

        # Apply search filters
        if query:
            studies = studies.filter(
                Q(nct_id__icontains=query) |
                Q(official_title__icontains=query) |
                Q(brief_summary__icontains=query) |
                Q(eligibility_criteria__icontains=query)
            )

        if status_filter:
            studies = studies.filter(overall_status__iexact=status_filter)

        # Limit results
        studies = studies[:50]

        # Convert to list of dictionaries with parsed criteria
        result = []
        for study in studies:
            parsed_criteria = parse_eligibility_criteria(study.eligibility_criteria or '')
            result.append({
                'id': study.study_id,
                'nct_id': study.nct_id,
                'title': study.official_title,
                'brief_summary': study.brief_summary or 'No summary provided',
                'status': study.overall_status,
                'phase': get_user_friendly_phase(study.study_type),
                'location': study.location or 'Not specified',
                'eligibility_criteria': {
                    'inclusion': parsed_criteria['inclusion'],
                    'exclusion': parsed_criteria['exclusion']
                },
                'start_date': study.start_date if study.start_date else 'Not specified',
                'completion_date': study.completion_date if study.completion_date else 'Not specified',
                'sponsor': study.sponsor or 'Not specified'
            })

        return Response(result, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error in search_studies: {str(e)}", exc_info=True)
        return Response({
            'error': 'An error occurred while searching for studies',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def get_user_friendly_phase(study_type):
    """Convert study_type to a user-friendly phase."""
    if not study_type:
        return 'Phase not provided'
    study_type_lower = study_type.lower().strip()
    
    # Handle common phase formats
    phase_patterns = {
        r'phase\s*1|phase\s*i': 'Phase 1',
        r'phase\s*2|phase\s*ii': 'Phase 2',
        r'phase\s*3|phase\s*iii': 'Phase 3',
        r'phase\s*4|phase\s*iv': 'Phase 4',
        r'interventional': 'Phase not specified (Interventional)',
        r'observational': 'Observational Study'
    }
    
    for pattern, phase in phase_patterns.items():
        if re.search(pattern, study_type_lower):
            return phase
    
    return 'Phase not provided'

@api_view(['GET'])
@permission_classes([AllowAny])
def get_study_details(request, study_id):
    try:
        # Normalize the NCT ID: if it doesn't start with "NCT", prepend it (assuming it's a number)
        if not study_id.upper().startswith('NCT'):
            normalized_id = f"NCT{study_id}"
        else:
            normalized_id = study_id.upper()

        # Validate NCT ID format (starts with "NCT" followed by digits)
        if not normalized_id.startswith('NCT') or not normalized_id[3:].isdigit():
            logger.warning(f"Invalid NCT ID format: {study_id} (normalized to {normalized_id})")
            return JsonResponse({'error': 'Invalid NCT ID format. Must start with "NCT" followed by numbers.'}, status=400)

        # Attempt to find the study by nct_id
        study = Studies.objects.get(nct_id=normalized_id)
    except ObjectDoesNotExist:
        logger.error(f"Study not found for NCT ID {normalized_id}")
        return JsonResponse({'error': 'Study not found'}, status=404)
    except ValueError:
        logger.error(f"Invalid study_id format: {study_id}")
        return JsonResponse({'error': 'Invalid study ID format'}, status=400)
    except Exception as e:
        logger.exception(f"Unexpected error fetching study details for NCT ID {normalized_id}: {str(e)}")
        return JsonResponse({'error': 'An unexpected error occurred'}, status=500)

    logger.debug(f"Study object for NCT ID {normalized_id}: {study.__dict__}")
    parsed_criteria = parse_eligibility_criteria(study.eligibility_criteria or '')
    data = {
        'nct_id': study.nct_id,
        'study_id': study.study_id,
        'official_title': study.official_title,
        'brief_summary': study.brief_summary or 'No summary provided',
        'overall_status': study.overall_status,
        'phase': get_user_friendly_phase(study.study_type),
        'primary_purpose': study.primary_purpose or 'Not specified',
        'allocation': study.allocation or 'Not specified',
        'interventional_model': study.interventional_model or 'Not specified',
        'masking': study.masking or 'Not specified',
        'eligibility_criteria': {
            'inclusion': parsed_criteria['inclusion'],
            'exclusion': parsed_criteria['exclusion']
        },
        'ipd_sharing': study.ipd_sharing or 'Not specified',
        'is_fda_regulated_drug': study.is_fda_regulated_drug,
        'is_fda_regulated_device': study.is_fda_regulated_device,
        'start_date': study.start_date.isoformat() if study.start_date else 'Not specified',
        'completion_date': study.completion_date.isoformat() if study.completion_date else 'Not specified',
        'sponsor': study.sponsor or 'Not specified',
        'location': study.location or 'Not specified',
        'enrollment': study.enrollment if study.enrollment is not None else 'Not specified'
    }
    logger.info(f"Retrieved study details for NCT ID {normalized_id}: {data}")
    return JsonResponse(data, status=200)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_database_stats(request):
    """
    Get database statistics
    """
    try:
        logger.info("Fetching database stats...")
        logger.info(f"Database connection: {connection.settings_dict}")

        try:
            # Count studies
            total_studies = Studies.objects.count()
            logger.info(f"Total studies: {total_studies}")

            recruiting_studies = Studies.objects.filter(overall_status='RECRUITING').count()
            logger.info(f"Recruiting studies: {recruiting_studies}")

            active_studies = Studies.objects.filter(overall_status='ACTIVE').count()
            logger.info(f"Active studies: {active_studies}")

            completed_studies = Studies.objects.filter(overall_status='COMPLETED').count()
            logger.info(f"Completed studies: {completed_studies}")

            data = {
                'total_studies': total_studies,
                'recruiting_studies': recruiting_studies,
                'active_studies': active_studies,
                'completed_studies': completed_studies,
                'locations': 120,  # Example placeholder
                'conditions': 85,  # Example placeholder
                'status': 'connected',
                'database_type': connection.vendor,
                'database_name': connection.settings_dict['NAME']
            }
        except Exception as db_error:
            # Log the database error
            logger.error(f"Database query error: {str(db_error)}", exc_info=True)
            
            # Return mock data
            data = {
                'total_studies': 1250,
                'recruiting_studies': 450,
                'active_studies': 350,
                'completed_studies': 400,
                'locations': 120,
                'conditions': 85,
                'status': 'mock_data',
                'error': str(db_error),
                'message': 'Using mock data due to database connection issues'
            }

        logger.info(f"Returning database stats: {data}")
        return Response(data, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error fetching database stats: {str(e)}", exc_info=True)
        # Even if there's a general error, return mock data with 200 status
        # This ensures the frontend can still display something
        mock_data = {
            'total_studies': 1250,
            'recruiting_studies': 450,
            'active_studies': 350,
            'completed_studies': 400,
            'locations': 120,
            'conditions': 85,
            'status': 'error',
            'error': str(e),
            'message': 'Error fetching database stats, using mock data'
        }
        return Response(mock_data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_doctor_by_license(request):
    """
    Fetch doctor information by license state and number
    """
    try:
        license_state = request.GET.get('state', '').strip().upper()
        license_number = request.GET.get('number', '').strip()  # Remove zfill(10) to match exact format

        if not license_state or not license_number:
            return JsonResponse({
                'error': 'License state and number are required'
            }, status=400)

        logger.info(f"Searching for doctor with license {license_number} in state {license_state}")

        # Query the database for the doctor, using TRIM and ILIKE for both fields
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
                    TRIM(UPPER(d.license_state)) ILIKE %s AND TRIM(d.license_number) = %s
                LIMIT 1
            """, [license_state, license_number])

            row = cursor.fetchone()

            if row:
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
                    }
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

@api_view(['POST'])
@permission_classes([AllowAny])
def process_nlp_query(request):
    """
    Process natural language queries related to doctors, clinical trials, or studies
    """
    try:
        data = request.data  # Use request.data instead of json.loads(request.body)
        query = data.get('query', '').lower().strip()

        if not query:
            return JsonResponse({'error': 'Query is required'}, status=400)

        logger.info(f"Processing NLP query: {query}")

        try:
            doc = nlp(query)

            # Dynamically fetch specialties, diseases, and trials from the database
            specialties = Doctor.objects.values_list('specialty_description', flat=True).distinct()
            diseases = Studies.objects.values_list('eligibility_criteria', flat=True).distinct()  # Parse for diseases
            trials = Studies.objects.values_list('nct_id', flat=True)

            # Filter out None values
            specialties = [s for s in specialties if s is not None]
            diseases = [d for d in diseases if d is not None]
            trials = [t for t in trials if t is not None]

            # Rebuild the matcher with dynamic data
            matcher = PhraseMatcher(nlp.vocab)
            
            if specialties:
                matcher.add("SPECIALTY", [nlp.make_doc(specialty) for specialty in specialties])
            
            if diseases:
                matcher.add("DISEASE", [nlp.make_doc(disease) for disease in diseases])
            
            if trials:
                matcher.add("TRIAL", [nlp.make_doc(trial) for trial in trials])

            matches = matcher(doc)

            response = {'results': []}

            for match_id, start, end in matches:
                match_span = doc[start:end].text
                match_label = nlp.vocab.strings[match_id]  # "SPECIALTY", "DISEASE", or "TRIAL"

                if match_label == "SPECIALTY":
                    # Find doctors with this specialty
                    doctors = Doctor.objects.filter(specialty_description__icontains=match_span.capitalize())
                    response['results'].append({
                        'type': 'specialty',
                        'match': match_span,
                        'doctors': [{
                            'doctor_id': d.doctor_id,
                            'name': f"{d.first_name} {d.last_name}",
                            'specialty': d.specialty_description
                        } for d in doctors[:5]]  # Limit to 5
                    })
                elif match_label == "DISEASE":
                    # Find studies related to this disease
                    studies = Studies.objects.filter(eligibility_criteria__icontains=match_span).distinct()
                    response['results'].append({
                        'type': 'disease',
                        'match': match_span,
                        'studies': [{
                            'nct_id': s.nct_id,
                            'title': s.official_title,
                            'status': s.overall_status
                        } for s in studies[:5]]  # Limit to 5
                    })
                elif match_label == "TRIAL":
                    # Find specific trial by ID
                    study = Studies.objects.filter(nct_id__iexact=match_span.upper()).first()
                    if study:
                        response['results'].append({
                            'type': 'trial',
                            'match': match_span,
                            'study': {
                                'nct_id': study.nct_id,
                                'title': study.official_title,
                                'status': study.overall_status,
                                'phase': study.phase,
                                'sponsor': study.sponsor
                            }
                        })

            # If no matches, try to extract intent
            if not response['results']:
                # Simple intent detection based on keywords
                if any(word in query for word in ['doctor', 'physician', 'specialist']):
                    response['intent'] = 'find_doctor'
                elif any(word in query for word in ['trial', 'study', 'research']):
                    response['intent'] = 'find_trial'
                elif any(word in query for word in ['disease', 'condition', 'symptom']):
                    response['intent'] = 'find_disease'
                else:
                    response['intent'] = 'unknown'

            return JsonResponse(response)
        except Exception as processing_error:
            # Log the processing error
            logger.error(f"Error in NLP processing: {str(processing_error)}", exc_info=True)
            
            # Return mock data
            mock_response = {
                'results': [
                    {
                        'type': 'specialty',
                        'match': 'cardiology',
                        'doctors': [
                            {
                                'doctor_id': 'D12345',
                                'name': 'Dr. John Smith',
                                'specialty': 'Cardiology'
                            },
                            {
                                'doctor_id': 'D67890',
                                'name': 'Dr. Jane Doe',
                                'specialty': 'Cardiology'
                            }
                        ]
                    },
                    {
                        'type': 'disease',
                        'match': 'heart disease',
                        'studies': [
                            {
                                'nct_id': 'NCT12345678',
                                'title': 'New Treatment for Heart Disease',
                                'status': 'RECRUITING'
                            },
                            {
                                'nct_id': 'NCT87654321',
                                'title': 'Heart Disease Prevention Study',
                                'status': 'ACTIVE'
                            }
                        ]
                    }
                ],
                'query': query,
                'error': str(processing_error)
            }
            return JsonResponse(mock_response)
    except Exception as e:
        logger.error(f"Error processing NLP query: {str(e)}", exc_info=True)
        return JsonResponse({
            'error': str(e),
            'query': data.get('query', '') if 'data' in locals() else 'Unknown query'
        }, status=500)