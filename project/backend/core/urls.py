from django.contrib import admin
from django.urls import path, include
from . import views
from api.views import send_email

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/trials/active/', views.get_active_trials, name='active_trials'),
    path('api/studies/featured/', views.get_featured_studies, name='featured_studies'),
    path('api/studies/<str:study_id>/', views.get_study_details, name='study_details'),
    path('api/studies/', views.search_studies, name='search_studies'),
    path('api/enrollment/request/', views.create_enrollment_request, name='enrollment_request'),
    path('api/stats/database/', views.get_database_stats, name='database_stats'),
    path('api/nlp/process/', views.process_nlp_query, name='process_nlp'),
    path('api/doctors/license/', views.get_doctor_by_license, name='get_doctor_by_license'),
    path('api/send-email/', send_email, name='send_email'),
] 