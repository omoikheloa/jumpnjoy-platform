from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import (
    DashboardViewSet, AnalyticsViewSet, UserViewSet,
    DailyStatsViewSet, CafeChecklistViewSet, SafetyCheckViewSet, IncidentReportViewSet, StaffShiftViewSet,
    CleaningLogViewSet, MaintenanceLogViewSet, StaffAppraisalViewSet,
    DailyInspectionListCreateView, DailyInspectionDetailView,
    RemedialActionListCreateView, RemedialActionDetailView, WaiverViewSet
)

# Create a single router for all ViewSets
router = DefaultRouter()

# Register all ViewSets with the router
router.register(r'users', UserViewSet, basename='user')
router.register(r'daily-stats', DailyStatsViewSet, basename='dailystats')
router.register(r'cafe-checklists', CafeChecklistViewSet, basename='cafechecklist')
router.register(r'safety-checks', SafetyCheckViewSet, basename='safetycheck') # <-- Uncommented
router.register(r'incidents', IncidentReportViewSet, basename='incidentreport')
router.register(r'shifts', StaffShiftViewSet, basename='staffshift')
router.register(r'cleaning', CleaningLogViewSet, basename='cleaninglog')
router.register(r'maintenance', MaintenanceLogViewSet, basename='maintenancelog')
router.register(r'appraisals', StaffAppraisalViewSet, basename='staffappraisal')
router.register(r"waivers", WaiverViewSet, basename="waiver")

# Define all URL patterns
urlpatterns = [
    # Authentication endpoints
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/me/', views.me_view, name='me'),

    # Dashboard & Analytics
    path('dashboard/', DashboardViewSet.as_view({'get': 'overview'}), name='dashboard-viewset'),
    path('dashboard/data/', views.dashboard_data, name='dashboard-data'),
    path('analytics/', AnalyticsViewSet.as_view({'get': 'overview'}), name='analytics'),

    # Daily Inspection endpoints
    path('daily-inspections/', DailyInspectionListCreateView.as_view(), name='daily-inspection-list'),
    path('daily-inspections/<int:pk>/', DailyInspectionDetailView.as_view(), name='daily-inspection-detail'),
    
    # Remedial Action endpoints
    path('remedial-actions/', RemedialActionListCreateView.as_view(), name='remedial-action-list'),
    path('remedial-actions/<int:pk>/', RemedialActionDetailView.as_view(), name='remedial-action-detail'),
    
    # Inspection Dashboard endpoint 
    path('inspection-dashboard/', views.inspection_dashboard, name='inspection-dashboard'),
    
    # Include all router-generated URLs
    path('', include(router.urls)),
]