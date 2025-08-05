from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import datetime, timedelta
from .models import User, SafetyCheck, IncidentReport, StaffShift, CleaningLog, MaintenanceLog, DailyStats
from .serializers import (
    UserSerializer, AuthSerializer, SafetyCheckSerializer, IncidentReportSerializer,
    StaffShiftSerializer, CleaningLogSerializer, MaintenanceLogSerializer, DailyStatsSerializer
)

class IsOwnerOrStaffReadOnly(permissions.BasePermission):
    """
    Custom permission class:
    - Owners: Full access to all data
    - Staff: Can create and view their own data only
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        if request.user.role == 'owner':
            return True
        
        # Staff can only read and create
        return request.method in ['GET', 'POST']
    
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'owner':
            return True
        
        # Staff can only access their own records
        if hasattr(obj, 'checked_by'):
            return obj.checked_by == request.user
        elif hasattr(obj, 'reported_by'):
            return obj.reported_by == request.user
        elif hasattr(obj, 'staff_member'):
            return obj.staff_member == request.user
        elif hasattr(obj, 'cleaned_by'):
            return obj.cleaned_by == request.user
        elif hasattr(obj, 'performed_by'):
            return obj.performed_by == request.user
        elif hasattr(obj, 'recorded_by'):
            return obj.recorded_by == request.user
        
        return False

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """
    User authentication endpoint
    Returns authentication token and user data
    """
    serializer = AuthSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
            'message': 'Login successful'
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """
    User logout endpoint
    Destroys authentication token
    """
    try:
        request.user.auth_token.delete()
        return Response({'message': 'Logged out successfully'})
    except:
        return Response({'message': 'Error during logout'}, status=status.HTTP_400_BAD_REQUEST)

class SafetyCheckViewSet(viewsets.ModelViewSet):
    """
    Safety Check API endpoints
    Handles CRUD operations for safety inspections
    """
    serializer_class = SafetyCheckSerializer
    permission_classes = [IsOwnerOrStaffReadOnly]

    def get_queryset(self):
        """
        Filter queryset based on user role
        """
        if self.request.user.role == 'owner':
            return SafetyCheck.objects.all()
        return SafetyCheck.objects.filter(checked_by=self.request.user)

    def perform_create(self, serializer):
        """
        Automatically set the user who performed the check
        """
        serializer.save(checked_by=self.request.user)

    @action(detail=False, methods=['get'])
    def recent_failures(self, request):
        """
        Custom endpoint: Get recent failed safety checks
        """
        if request.user.role != 'owner':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        week_ago = timezone.now().date() - timedelta(days=7)
        failed_checks = SafetyCheck.objects.filter(
            date__gte=week_ago,
            overall_pass=False
        )
        serializer = self.get_serializer(failed_checks, many=True)
        return Response(serializer.data)

class IncidentReportViewSet(viewsets.ModelViewSet):
    """
    Incident Report API endpoints
    Critical for legal compliance and safety tracking
    """
    serializer_class = IncidentReportSerializer
    permission_classes = [IsOwnerOrStaffReadOnly]

    def get_queryset(self):
        if self.request.user.role == 'owner':
            return IncidentReport.objects.all()
        return IncidentReport.objects.filter(reported_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user)

    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """
        Custom endpoint: Get incidents grouped by type
        """
        if request.user.role != 'owner':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        incidents_by_type = IncidentReport.objects.values('incident_type').annotate(
            count=Count('id')
        )
        return Response(incidents_by_type)

class StaffShiftViewSet(viewsets.ModelViewSet):
    """
    Staff Shift API endpoints
    Tracks employee scheduling and hours
    """
    serializer_class = StaffShiftSerializer
    permission_classes = [IsOwnerOrStaffReadOnly]

    def get_queryset(self):
        if self.request.user.role == 'owner':
            return StaffShift.objects.all()
        return StaffShift.objects.filter(staff_member=self.request.user)

class CleaningLogViewSet(viewsets.ModelViewSet):
    """
    Cleaning Log API endpoints
    Health department compliance tracking
    """
    serializer_class = CleaningLogSerializer
    permission_classes = [IsOwnerOrStaffReadOnly]

    def get_queryset(self):
        if self.request.user.role == 'owner':
            return CleaningLog.objects.all()
        return CleaningLog.objects.filter(cleaned_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(cleaned_by=self.request.user)

class MaintenanceLogViewSet(viewsets.ModelViewSet):
    """
    Maintenance Log API endpoints
    Equipment maintenance history and scheduling
    """
    serializer_class = MaintenanceLogSerializer
    permission_classes = [IsOwnerOrStaffReadOnly]

    def get_queryset(self):
        if self.request.user.role == 'owner':
            return MaintenanceLog.objects.all()
        return MaintenanceLog.objects.filter(performed_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(performed_by=self.request.user)

    @action(detail=False, methods=['get'])
    def upcoming_maintenance(self, request):
        """
        Custom endpoint: Get upcoming maintenance items
        """
        if request.user.role != 'owner':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        next_month = timezone.now().date() + timedelta(days=30)
        upcoming = MaintenanceLog.objects.filter(
            next_maintenance_due__lte=next_month,
            next_maintenance_due__gte=timezone.now().date()
        )
        serializer = self.get_serializer(upcoming, many=True)
        return Response(serializer.data)

class DailyStatsViewSet(viewsets.ModelViewSet):
    """
    Daily Stats API endpoints
    Business analytics and reporting data
    """
    serializer_class = DailyStatsSerializer
    permission_classes = [IsOwnerOrStaffReadOnly]

    def get_queryset(self):
        if self.request.user.role == 'owner':
            return DailyStats.objects.all()
        return DailyStats.objects.filter(recorded_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_data(request):
    """
    Dashboard data endpoint for owners
    Provides aggregated statistics and analytics
    """
    if request.user.role != 'owner':
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    
    # Get daily stats for the last 30 days
    daily_stats = DailyStats.objects.filter(date__gte=month_ago).order_by('date')
    
    # Calculate summary statistics
    total_visitors_month = daily_stats.aggregate(total=Sum('visitor_count'))['total'] or 0
    total_sales_month = daily_stats.aggregate(total=Sum('cafe_sales'))['total'] or 0
    
    # Recent incidents count
    recent_incidents = IncidentReport.objects.filter(date__gte=week_ago).count()
    
    # Failed safety checks count
    failed_checks = SafetyCheck.objects.filter(
        date__gte=week_ago, 
        overall_pass=False
    ).count()
    
    # Active staff count
    active_staff = User.objects.filter(
        role='staff',
        is_active=True
    ).count()
    
    # Prepare chart data for frontend
    chart_data = []
    for stat in daily_stats:
        chart_data.append({
            'date': stat.date.strftime('%Y-%m-%d'),
            'visitors': stat.visitor_count,
            'sales': float(stat.cafe_sales)
        })
    
    # Recent activity for dashboard feed
    recent_activity = []
    
    # Recent safety checks
    recent_safety = SafetyCheck.objects.filter(date__gte=week_ago)[:5]
    for check in recent_safety:
        recent_activity.append({
            'type': 'safety_check',
            'message': f"Safety check for {check.trampoline_id} - {'Passed' if check.overall_pass else 'Failed'}",
            'date': check.created_at.isoformat(),
            'user': check.checked_by.get_full_name()
        })
    
    # Recent incidents
    recent_incidents_list = IncidentReport.objects.filter(date__gte=week_ago)[:3]
    for incident in recent_incidents_list:
        recent_activity.append({
            'type': 'incident',
            'message': f"Incident reported: {incident.incident_type}",
            'date': incident.created_at.isoformat(),
            'user': incident.reported_by.get_full_name()
        })
    
    # Sort recent activity by date
    recent_activity.sort(key=lambda x: x['date'], reverse=True)
    
    return Response({
        'summary': {
            'total_visitors_month': total_visitors_month,
            'total_sales_month': float(total_sales_month),
            'recent_incidents': recent_incidents,
            'failed_checks': failed_checks,
            'active_staff': active_staff,
        },
        'chart_data': chart_data,
        'recent_activity': recent_activity[:10]  # Latest 10 activities
    })
