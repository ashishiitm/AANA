from django.urls import path, include
from rest_framework.routers import DefaultRouter
from trial_match.views import protocol_views

# Create a router and register our viewsets
router = DefaultRouter()
router.register(r'protocols', protocol_views.ProtocolViewSet, basename='protocol')

# The API URLs are now determined automatically by the router
urlpatterns = [
    path('', include(router.urls)),
] 