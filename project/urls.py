from django.contrib import admin
from core import views
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.views import PlatformTrialViewSet, home, get_study_details # Keep home if you want it; adjust if not needed

# Create a router for the viewsets
router = DefaultRouter()
router.register(r'trials', PlatformTrialViewSet, basename='trials')  # Register PlatformTrialViewSet with a basename

# Define URL patterns
urlpatterns = [
    path('enrollment-request/', views.create_enrollment_request, name='create_enrollment_request'),
    path('admin/', admin.site.urls),
    path('', views.home, name='home'),  # Homepage
    path('api/conditions/', views.get_conditions, name='get_conditions'),  # API for conditions
    path('api/locations/', views.get_locations, name='get_locations'),  # API for locations
    path('api/phases/', views.get_phases, name='get_phases'),  # API for phases
    path('api/active-trials/', views.get_active_trials, name='get_active_trials'),  # API for active trials
    path('api/featured-studies/', views.get_featured_studies, name='featured_studies'),  # API for featured studies
    path('api/stats/database/', views.get_database_stats, name='get_database_stats'),  # API for database stats
    path('api/studies/<str:study_id>/', views.get_study_details, name='study_details'),  # Add this line for study details
]

