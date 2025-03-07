"""
Example implementation of the database statistics API endpoint for Django.

This file shows how to implement the /api/stats/database endpoint in your Django backend.
You can copy the relevant parts to your views.py file.
"""

from django.http import JsonResponse
from django.db.models import Count, Avg, Sum, F, Q
from django.utils import timezone
from datetime import timedelta
import json

# Import your models here
# from .models import PlatformTrial, Condition, Location

def get_database_stats(request):
    """
    API endpoint that returns statistics about the clinical trials database.
    
    Expected response format:
    {
        "totalTrials": 1250,
        "recruitingTrials": 450,
        "completedTrials": 320,
        "suspendedTrials": 15,
        "participantsEnrolled": 28500,
        "averageEnrollment": 120,
        "topConditions": [
            {"name": "Diabetes", "count": 145},
            {"name": "Cancer", "count": 132},
            ...
        ],
        "topLocations": [
            {"name": "New York", "count": 210},
            {"name": "Boston", "count": 185},
            ...
        ],
        "recentUpdates": [
            {"id": "NCT12345678", "title": "New Diabetes Trial", "date": "2023-03-01"},
            {"id": "NCT23456789", "title": "Cancer Immunotherapy Study", "date": "2023-02-28"},
            ...
        ]
    }
    """
    # Get query parameters
    view_mode = request.GET.get('viewMode', 'patient')
    time_range = request.GET.get('timeRange', 'all')
    
    # Define time filter based on timeRange
    now = timezone.now()
    time_filter = Q()
    
    if time_range == 'month':
        time_filter = Q(last_updated__gte=now - timedelta(days=30))
    elif time_range == 'quarter':
        time_filter = Q(last_updated__gte=now - timedelta(days=90))
    elif time_range == 'year':
        time_filter = Q(last_updated__gte=now - timedelta(days=365))
    
    # Uncomment and modify this code to use your actual models
    
    # # Get total counts
    # total_trials = PlatformTrial.objects.count()
    # recruiting_trials = PlatformTrial.objects.filter(overall_status='RECRUITING').count()
    # completed_trials = PlatformTrial.objects.filter(overall_status='COMPLETED').count()
    # suspended_trials = PlatformTrial.objects.filter(overall_status='SUSPENDED').count()
    
    # # Calculate enrollment statistics
    # trials_with_enrollment = PlatformTrial.objects.exclude(enrollment__isnull=True)
    # total_participants = sum(trial.enrollment or 0 for trial in trials_with_enrollment)
    # avg_enrollment = total_participants / trials_with_enrollment.count() if trials_with_enrollment.count() > 0 else 0
    
    # # Get top conditions
    # top_conditions = (
    #     Condition.objects.values('name')
    #     .annotate(count=Count('platformtrial'))
    #     .order_by('-count')[:5]
    # )
    
    # # Get top locations
    # top_locations = (
    #     Location.objects.values('name')
    #     .annotate(count=Count('platformtrial'))
    #     .order_by('-count')[:5]
    # )
    
    # # Get recent updates (trials updated in the last 30 days)
    # thirty_days_ago = timezone.now() - timedelta(days=30)
    # recent_updates = (
    #     PlatformTrial.objects.filter(last_update_posted__gte=thirty_days_ago)
    #     .order_by('-last_update_posted')[:3]
    #     .values('study_id', 'official_title', 'last_update_posted')
    # )
    
    # # Format recent updates
    # formatted_updates = [
    #     {
    #         'id': update['study_id'],
    #         'title': update['official_title'],
    #         'date': update['last_update_posted'].strftime('%Y-%m-%d')
    #     }
    #     for update in recent_updates
    # ]
    
    # # Prepare response
    # response_data = {
    #     'totalTrials': total_trials,
    #     'recruitingTrials': recruiting_trials,
    #     'completedTrials': completed_trials,
    #     'suspendedTrials': suspended_trials,
    #     'participantsEnrolled': total_participants,
    #     'averageEnrollment': round(avg_enrollment),
    #     'topConditions': list(top_conditions),
    #     'topLocations': list(top_locations),
    #     'recentUpdates': formatted_updates
    # }
    
    # For testing purposes, return mock data
    # In production, replace this with actual data from your database
    
    # Base mock data
    base_data = {
        'totalTrials': 1250,
        'recruitingTrials': 450,
        'completedTrials': 320,
        'suspendedTrials': 15,
        'participantsEnrolled': 28500,
        'averageEnrollment': 120,
        'topConditions': [
            {'name': 'Diabetes', 'count': 145},
            {'name': 'Cancer', 'count': 132},
            {'name': 'Alzheimer\'s', 'count': 87},
            {'name': 'Heart Disease', 'count': 76},
            {'name': 'COVID-19', 'count': 65}
        ],
        'topLocations': [
            {'name': 'New York', 'count': 210},
            {'name': 'Boston', 'count': 185},
            {'name': 'San Francisco', 'count': 142},
            {'name': 'Chicago', 'count': 98},
            {'name': 'Houston', 'count': 76}
        ],
        'recentUpdates': [
            {'id': 'NCT12345678', 'title': 'New Diabetes Trial', 'date': '2023-03-01'},
            {'id': 'NCT23456789', 'title': 'Cancer Immunotherapy Study', 'date': '2023-02-28'},
            {'id': 'NCT34567890', 'title': 'Alzheimer\'s Prevention Trial', 'date': '2023-02-25'}
        ]
    }
    
    # Adjust data based on time range (simplified for mock data)
    if time_range == 'month':
        for key in ['totalTrials', 'recruitingTrials', 'completedTrials', 'participantsEnrolled']:
            base_data[key] = int(base_data[key] * 0.1)  # 10% of total for last month
    elif time_range == 'quarter':
        for key in ['totalTrials', 'recruitingTrials', 'completedTrials', 'participantsEnrolled']:
            base_data[key] = int(base_data[key] * 0.3)  # 30% of total for last quarter
    elif time_range == 'year':
        for key in ['totalTrials', 'recruitingTrials', 'completedTrials', 'participantsEnrolled']:
            base_data[key] = int(base_data[key] * 0.8)  # 80% of total for last year
    
    # Add view-specific mock data
    if view_mode == 'pharma':
        pharma_data = {
            'enrollmentRate': 85,  # percentage
            'retentionRate': 78,  # percentage
            'averageCompletionTime': 14.5,  # months
            'costPerPatient': 12500,  # dollars
            'topPerformingDoctors': [
                {'name': 'Dr. Sarah Johnson', 'enrollments': 45, 'completionRate': 92},
                {'name': 'Dr. Michael Chen', 'enrollments': 38, 'completionRate': 89},
                {'name': 'Dr. Robert Williams', 'enrollments': 32, 'completionRate': 94}
            ],
            'phaseDistribution': [
                {'phase': 'Phase 1', 'count': 320},
                {'phase': 'Phase 2', 'count': 450},
                {'phase': 'Phase 3', 'count': 380},
                {'phase': 'Phase 4', 'count': 100}
            ],
            'sponsorDistribution': [
                {'name': 'Pfizer', 'count': 85},
                {'name': 'Novartis', 'count': 72},
                {'name': 'Roche', 'count': 68},
                {'name': 'Merck', 'count': 65},
                {'name': 'Johnson & Johnson', 'count': 58}
            ],
            'monthlyRecruitment': [
                {'month': 'Jan', 'count': 120},
                {'month': 'Feb', 'count': 145},
                {'month': 'Mar', 'count': 165},
                {'month': 'Apr', 'count': 132},
                {'month': 'May', 'count': 148},
                {'month': 'Jun', 'count': 175}
            ]
        }
        base_data.update(pharma_data)
    else:
        patient_data = {
            'nearbyTrials': 32,
            'matchingTrials': 18,
            'eligibilityRate': 72,  # percentage
            'patientDemographics': [
                {'age': '18-30', 'percentage': 15},
                {'age': '31-45', 'percentage': 28},
                {'age': '46-60', 'percentage': 35},
                {'age': '61+', 'percentage': 22}
            ],
            'popularTreatments': [
                {'name': 'Immunotherapy', 'count': 87},
                {'name': 'Gene Therapy', 'count': 65},
                {'name': 'Stem Cell Treatment', 'count': 54},
                {'name': 'Precision Medicine', 'count': 48},
                {'name': 'Combination Therapy', 'count': 42}
            ],
            'patientSatisfaction': 4.2,  # out of 5
            'averageDistance': 12.5  # miles
        }
        base_data.update(patient_data)
    
    return JsonResponse(base_data)

# Add this to your urls.py:
# path('api/stats/database/', views.get_database_stats, name='get_database_stats'), 