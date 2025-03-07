from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),           # Homepage
    
    # API endpoints for data
    path('api/conditions/', views.get_conditions, name='conditions'),
    path("api/locations/", views.get_locations, name="locations"),
    path("api/phases/", views.get_phases, name="phases"),
    
    # API endpoints for studies
    path("api/active-trials/", views.get_active_trials, name="active_trials"),
    path("api/featured-studies/", views.get_featured_studies, name="featured_studies"),
    
    # API endpoints for statistics
    path("api/stats/database/", views.get_database_stats, name="get_database_stats"),
    
    # API endpoints for study-specific data
    path("faqs/<int:study_id>/", views.get_faqs, name="get_faqs"),
    path("recruitment-message/<int:study_id>/", views.get_recruitment_message, name="get_recruitment_message"),
    path("classification/<int:study_id>/", views.get_classification, name="get_classification"),
    path("report/<int:study_id>/", views.get_report, name="get_report"),
    path('api/study/<int:study_id>/', views.get_study_details, name='study_details'),
]