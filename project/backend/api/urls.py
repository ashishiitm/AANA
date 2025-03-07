from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StudiesViewSet, StudyEnrollmentRequestViewSet,
    SearchRuleViewSet, SearchCriterionViewSet, 
    PubMedArticleViewSet, SearchResultViewSet, AdverseEventTermViewSet,
    TrialsViewSet, send_email
)

router = DefaultRouter()
# Existing endpoints
router.register(r'studies', StudiesViewSet)
router.register(r'enrollment-requests', StudyEnrollmentRequestViewSet, basename='enrollment-requests')
router.register(r'trials', TrialsViewSet, basename='trials')

# Pharmacovigilance endpoints
router.register(r'pv/search-rules', SearchRuleViewSet)
router.register(r'pv/search-criteria', SearchCriterionViewSet)
router.register(r'pv/pubmed-articles', PubMedArticleViewSet)
router.register(r'pv/search-results', SearchResultViewSet)
router.register(r'pv/adverse-event-terms', AdverseEventTermViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('send-email/', send_email, name='send_email'),
] 