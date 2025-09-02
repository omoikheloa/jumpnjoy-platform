from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for ViewSets
router = DefaultRouter()
router.register('safety-checks', views.SafetyCheckViewSet, basename='safetycheck')
router.register('incidents', views.IncidentReportViewSet, basename='incidentreport')
router.register('shifts', views.StaffShiftViewSet, basename='staffshift')
router.register('cleaning', views.CleaningLogViewSet, basename='cleaninglog')
router.register('maintenance', views.MaintenanceLogViewSet, basename='maintenancelog')
router.register('daily-stats', views.DailyStatsViewSet, basename='dailystats')
router.register('appraisals', views.StaffAppraisalViewSet, basename='staffappraisal')
router.register('cafe-checklists', views.CafeChecklistViewSet, basename='cafechecklist')

urlpatterns = [
    # Authentication endpoints
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/me/', views.me_view, name='me'),
    
    # Dashboard endpoint
    path('dashboard/', views.dashboard_data, name='dashboard'),
    
    # Include router URLs
    path('', include(router.urls)),
]