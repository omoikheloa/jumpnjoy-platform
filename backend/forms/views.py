from rest_framework import viewsets, status, permissions, filters, generics
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from django.contrib.auth import login
from django.db.models import Count, Sum, Q, Avg
from django.utils import timezone
from datetime import timedelta, datetime
from decimal import Decimal
import calendar, base64, datetime
from io import BytesIO
from django.http import HttpResponse, FileResponse
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from django.core.files.base import ContentFile
from .models import (
    BusinessTarget, CustomerSatisfactionSurvey, User, SafetyCheck, IncidentReport, StaffShift, CleaningLog,
    MaintenanceLog, DailyStats, StaffAppraisal, CafeChecklist, DailyInspection, RemedialAction, Waiver
)
from .permissions import AppraisalAccessPermission
from .serializers import (
    UserSerializer, AuthSerializer, SafetyCheckSerializer, IncidentReportSerializer,
    StaffShiftSerializer, CleaningLogSerializer, MaintenanceLogSerializer,
    DailyStatsSerializer, StaffAppraisalSerializer, CafeChecklistSerializer, DailyInspectionSerializer, RemedialActionSerializer, WaiverSerializer
)


class IsOwnerOrStaffReadOnly(permissions.BasePermission):
    """
    Custom permission:
    - Owners: Full access
    - Staff: Can create and view their own records only
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.user.role == 'owner':
            return True
        return request.method in ['GET', 'POST']

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'owner':
            return True

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
        elif hasattr(obj, 'updated_by'):
            return obj.updated_by == request.user

        return False


# ---------------- AUTH ----------------

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """Authenticate and return token + user details"""
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
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Destroy auth token"""
    try:
        request.user.auth_token.delete()
        return Response({'message': 'Logged out successfully'})
    except Exception:
        return Response({'message': 'Error during logout'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    """Return authenticated user details"""
    return Response(UserSerializer(request.user).data)

# ---------------- DASHBOARD ----------------
class DashboardViewSet(viewsets.ViewSet):
    """
    Dashboard endpoint for overview data
    """
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def overview(self, request):
        """Get dashboard overview data"""
        today = timezone.now().date()
        this_month = today.month
        this_year = today.year
        
        # Recent incidents (last 30 days)
        recent_incidents = IncidentReport.objects.filter(
            date_of_accident__gte=today - timedelta(days=30)
        ).count()
        
        # Today's visitors
        today_stats = DailyStats.objects.filter(date=today).first()
        today_visitors = today_stats.visitor_count if today_stats else 0
        
        # This month's revenue
        monthly_revenue = DailyStats.get_monthly_revenue(this_month, this_year)
        
        # Safety checks completed today
        safety_checks_today = SafetyCheck.objects.filter(date=today).count()
        
        # Pending maintenance items
        pending_maintenance = MaintenanceLog.objects.filter(
            next_maintenance_due__lte=today
        ).count()
        
        # Staff on duty today
        staff_on_duty = StaffShift.objects.filter(
            date=today,
            end_time__isnull=True
        ).count()
        
        # Recent appraisals (this month)
        recent_appraisals = StaffAppraisal.objects.filter(
            date_of_appraisal__month=this_month,
            date_of_appraisal__year=this_year
        ).count()
        
        return Response({
            'todayVisitors': today_visitors,
            'monthlyRevenue': float(monthly_revenue),
            'recentIncidents': recent_incidents,
            'safetyChecksToday': safety_checks_today,
            'pendingMaintenance': pending_maintenance,
            'staffOnDuty': staff_on_duty,
            'recentAppraisals': recent_appraisals
        })

# ---------------- ANALYTICS ----------------
class AnalyticsViewSet(viewsets.ViewSet):
    """
    Analytics endpoint for business metrics
    """
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def overview(self, request):
        """Get analytics overview data"""
        today = timezone.now().date()
        this_month = today.month
        this_year = today.year
        last_month = (today.replace(day=1) - timedelta(days=1)).month
        last_month_year = (today.replace(day=1) - timedelta(days=1)).year
        
        # Monthly revenue
        monthly_revenue = DailyStats.get_monthly_revenue(this_month, this_year)
        last_monthly_revenue = DailyStats.get_monthly_revenue(last_month, last_month_year)
        
        # Growth rate calculation
        growth_rate = 0
        if last_monthly_revenue > 0:
            growth_rate = ((monthly_revenue - last_monthly_revenue) / last_monthly_revenue) * 100
        
        # Monthly visitors
        monthly_visitors = DailyStats.get_monthly_visitors(this_month, this_year)
        
        # Conversion rate (cafe sales / total visitors)
        cafe_sales_this_month = DailyStats.objects.filter(
            date__month=this_month,
            date__year=this_year
        ).aggregate(total_cafe_sales=Sum('cafe_sales'))['total_cafe_sales'] or Decimal('0')
        
        conversion_rate = 0
        if monthly_visitors > 0:
            conversion_rate = (float(cafe_sales_this_month) / float(monthly_revenue)) * 100 if monthly_revenue > 0 else 0
        
        # Customer satisfaction average
        satisfaction = CustomerSatisfactionSurvey.objects.filter(
            date__month=this_month,
            date__year=this_year
        ).aggregate(avg_rating=Avg('overall_rating'))['avg_rating'] or 0
        
        # Peak hours calculation
        peak_hours_stats = DailyStats.objects.filter(
            date__month=this_month,
            date__year=this_year,
            peak_hour_start__isnull=False,
            peak_hour_end__isnull=False
        ).values('peak_hour_start', 'peak_hour_end')
        
        peak_hours = "2-6 PM"  # Default
        if peak_hours_stats:
            # Get most common peak hours
            most_common = peak_hours_stats.first()
            if most_common:
                start_hour = most_common['peak_hour_start'].strftime('%I %p').lstrip('0')
                end_hour = most_common['peak_hour_end'].strftime('%I %p').lstrip('0')
                peak_hours = f"{start_hour}-{end_hour}"
        
        # Target achievement calculation
        revenue_target = BusinessTarget.objects.filter(
            target_type='revenue',
            month=this_month,
            year=this_year
        ).first()
        
        target_achievement = 0
        if revenue_target and revenue_target.target_value > 0:
            target_achievement = (float(monthly_revenue) / float(revenue_target.target_value)) * 100
        else:
            target_achievement = 87  # Default value
        
        return Response({
            'growthRate': round(growth_rate, 1),
            'targetAchievement': round(target_achievement, 1),
            'satisfaction': round(satisfaction, 1) if satisfaction else 4.7,
            'peakHours': peak_hours,
            'monthlyRevenue': float(monthly_revenue),
            'monthlyVisitors': monthly_visitors,
            'conversionRate': round(conversion_rate, 1)
        })

# ---------------- USERS ----------------   
class UserViewSet(viewsets.ModelViewSet):
    """
    User management ViewSet
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter users based on permissions"""
        if self.request.user.role == 'owner':
            return User.objects.all()
        else:
            # Staff can only see themselves
            return User.objects.filter(id=self.request.user.id)
    
    def create(self, request, *args, **kwargs):
        """Create new user (owners only)"""
        if request.user.role != 'owner':
            return Response(
                {'error': 'Only owners can create users'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """Update user (owners only or self-update)"""
        user_to_update = self.get_object()
        if request.user.role != 'owner' and request.user.id != user_to_update.id:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Delete user (owners only)"""
        if request.user.role != 'owner':
            return Response(
                {'error': 'Only owners can delete users'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

    
# ---------------- SAFETY ----------------

class DailyInspectionListCreateView(generics.ListCreateAPIView):
    serializer_class = DailyInspectionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ['date', 'created_at', 'inspection_day']
    ordering = ['-date', '-created_at']
    search_fields = ['wc_number', 'inspector_initials', 'manager_initials']

    def get_queryset(self):
        queryset = DailyInspection.objects.select_related('checked_by', 'signed_off_by')
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
            
        # Filter by inspection day
        day = self.request.query_params.get('day')
        if day:
            queryset = queryset.filter(inspection_day=day)
            
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter == 'failed':
            queryset = queryset.exclude(
                framework_stability='pass',
                perimeter_netting='pass',
                wall_padding='pass',
                walkway_padding='pass',
                coverall_pads='pass',
                trampoline_beds='pass',
                safety_netting='pass',
                trampoline_springs='pass',
                fire_doors='pass',
                fire_equipment='pass',
                electrical_cables='pass',
                electrical_sockets='pass',
                first_aid_box='pass',
                signage='pass',
                area_cleanliness='pass',
                gates_locks='pass',
                trip_hazards='pass',
                staff_availability='pass'
            )
        elif status_filter == 'passed':
            queryset = queryset.filter(
                framework_stability='pass',
                perimeter_netting='pass',
                wall_padding='pass',
                walkway_padding='pass',
                coverall_pads='pass',
                trampoline_beds='pass',
                safety_netting='pass',
                trampoline_springs='pass',
                fire_doors='pass',
                fire_equipment='pass',
                electrical_cables='pass',
                electrical_sockets='pass',
                first_aid_box='pass',
                signage='pass',
                area_cleanliness='pass',
                gates_locks='pass',
                trip_hazards='pass',
                staff_availability='pass'
            )
        
        return queryset

    def perform_create(self, serializer):
        serializer.save(checked_by=self.request.user)

class DailyInspectionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DailyInspectionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return DailyInspection.objects.select_related('checked_by', 'signed_off_by').prefetch_related('remedial_actions')

class RemedialActionListCreateView(generics.ListCreateAPIView):
    serializer_class = RemedialActionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ['created_at', 'due_date', 'status']
    ordering = ['-created_at']
    search_fields = ['inspection_code', 'issue_description']

    def get_queryset(self):
        queryset = RemedialAction.objects.select_related('inspection', 'reported_by', 'assigned_to', 'completed_by')
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        # Filter by inspection ID
        inspection_id = self.request.query_params.get('inspection_id')
        if inspection_id:
            queryset = queryset.filter(inspection_id=inspection_id)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user)

class RemedialActionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = RemedialActionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return RemedialAction.objects.select_related('inspection', 'reported_by', 'assigned_to', 'completed_by')

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def inspection_dashboard(request):
    """Dashboard endpoint providing inspection statistics"""
    # Get date range (default to last 30 days)
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=30)
    
    # Override with query parameters if provided
    if request.GET.get('start_date'):
        start_date = datetime.strptime(request.GET.get('start_date'), '%Y-%m-%d').date()
    if request.GET.get('end_date'):
        end_date = datetime.strptime(request.GET.get('end_date'), '%Y-%m-%d').date()
    
    inspections = DailyInspection.objects.filter(date__range=[start_date, end_date])
    
    # Calculate statistics
    total_inspections = inspections.count()
    
    # Count inspections with any failed items
    failed_inspections = 0
    remedial_inspections = 0
    passed_inspections = 0
    
    for inspection in inspections:
        if inspection.failed_items_count > 0:
            failed_inspections += 1
        elif inspection.remedial_items_count > 0:
            remedial_inspections += 1
        else:
            passed_inspections += 1
    
    # Get remedial actions summary
    remedial_actions = RemedialAction.objects.filter(
        inspection__date__range=[start_date, end_date]
    ).values('status').annotate(count=Count('id'))
    
    remedial_summary = {action['status']: action['count'] for action in remedial_actions}
    
    # Recent failed inspections
    recent_failures = DailyInspection.objects.filter(
        date__range=[start_date, end_date]
    ).exclude(
        framework_stability='pass',
        perimeter_netting='pass',
        wall_padding='pass',
        walkway_padding='pass',
        coverall_pads='pass',
        trampoline_beds='pass',
        safety_netting='pass',
        trampoline_springs='pass',
        fire_doors='pass',
        fire_equipment='pass',
        electrical_cables='pass',
        electrical_sockets='pass',
        first_aid_box='pass',
        signage='pass',
        area_cleanliness='pass',
        gates_locks='pass',
        trip_hazards='pass',
        staff_availability='pass'
    ).order_by('-date')[:5]
    
    return Response({
        'date_range': {
            'start_date': start_date,
            'end_date': end_date
        },
        'summary': {
            'total_inspections': total_inspections,
            'passed_inspections': passed_inspections,
            'failed_inspections': failed_inspections,
            'remedial_inspections': remedial_inspections,
            'pass_rate': round((passed_inspections / total_inspections) * 100, 1) if total_inspections > 0 else 0
        },
        'remedial_actions': remedial_summary,
        'recent_failures': DailyInspectionSerializer(recent_failures, many=True).data
    })

class SafetyCheckViewSet(viewsets.ModelViewSet):
    serializer_class = SafetyCheckSerializer
    permission_classes = [IsOwnerOrStaffReadOnly]

    def get_queryset(self):
        if self.request.user.role == 'owner':
            return SafetyCheck.objects.all()
        return SafetyCheck.objects.filter(checked_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(checked_by=self.request.user)

    @action(detail=False, methods=['get'])
    def recent_failures(self, request):
        if request.user.role != 'owner':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)

        week_ago = timezone.now().date() - timedelta(days=7)
        failed_checks = SafetyCheck.objects.filter(
            date__gte=week_ago,
            overall_pass=False
        )
        serializer = self.get_serializer(failed_checks, many=True)
        return Response(serializer.data)


# ---------------- INCIDENTS ----------------

class IncidentReportViewSet(viewsets.ModelViewSet):
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
        if request.user.role != 'owner':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)

        incidents_by_type = IncidentReport.objects.values('incident_type').annotate(
            count=Count('id')
        )
        return Response(incidents_by_type)


# ---------------- STAFF SHIFTS ----------------

class StaffShiftViewSet(viewsets.ModelViewSet):
    serializer_class = StaffShiftSerializer
    permission_classes = [IsOwnerOrStaffReadOnly]

    def get_queryset(self):
        if self.request.user.role == 'owner':
            return StaffShift.objects.all()
        return StaffShift.objects.filter(staff_member=self.request.user)


# ---------------- CLEANING ----------------

class CleaningLogViewSet(viewsets.ModelViewSet):
    serializer_class = CleaningLogSerializer
    permission_classes = [IsOwnerOrStaffReadOnly]

    def get_queryset(self):
        if self.request.user.role == 'owner':
            return CleaningLog.objects.all()
        return CleaningLog.objects.filter(cleaned_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(cleaned_by=self.request.user)


# ---------------- MAINTENANCE ----------------

class MaintenanceLogViewSet(viewsets.ModelViewSet):
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
        if request.user.role != 'owner':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)

        next_month = timezone.now().date() + timedelta(days=30)
        upcoming = MaintenanceLog.objects.filter(
            next_maintenance_due__lte=next_month,
            next_maintenance_due__gte=timezone.now().date()
        )
        serializer = self.get_serializer(upcoming, many=True)
        return Response(serializer.data)


# ---------------- DAILY STATS ----------------

class DailyStatsViewSet(viewsets.ModelViewSet):
    serializer_class = DailyStatsSerializer
    permission_classes = [IsOwnerOrStaffReadOnly]

    def get_queryset(self):
        if self.request.user.role == 'owner':
            return DailyStats.objects.all()
        return DailyStats.objects.filter(recorded_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_data(request):
    if request.user.role != 'owner':
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)

    today = timezone.now().date()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)

    daily_stats = DailyStats.objects.filter(date__gte=month_ago).order_by('date')

    total_visitors_month = daily_stats.aggregate(total=Sum('visitor_count'))['total'] or 0
    total_sales_month = daily_stats.aggregate(total=Sum('cafe_sales'))['total'] or 0

    recent_incidents = IncidentReport.objects.filter(date_of_accident__gte=week_ago).count()
    failed_checks = SafetyCheck.objects.filter(date__gte=week_ago, overall_pass=False).count()
    active_staff = User.objects.filter(role='staff', is_active=True).count()

    chart_data = [
        {
            'date': stat.date.strftime('%Y-%m-%d'),
            'visitors': stat.visitor_count,
            'sales': float(stat.cafe_sales)
        }
        for stat in daily_stats
    ]

    recent_activity = []

    for check in SafetyCheck.objects.filter(date__gte=week_ago)[:5]:
        recent_activity.append({
            'type': 'safety_check',
            'message': f"Safety check for {check.trampoline_id} - {'Passed' if check.overall_pass else 'Failed'}",
            'date': check.created_at.isoformat(),
            'user': check.checked_by.get_full_name()
        })

    for incident in IncidentReport.objects.filter(date_of_accident__gte=week_ago)[:3]:
        recent_activity.append({
            'type': 'incident',
            'message': f"Incident reported: {incident.incident_type}",
            'date': incident.created_at.isoformat(),
            'user': incident.reported_by.get_full_name()
        })

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
        'recent_activity': recent_activity[:10]
    })


# ---------------- APPRAISALS ----------------

class StaffAppraisalViewSet(viewsets.ModelViewSet):
    """
    Staff Appraisals ViewSet
    Handles listing, searching, filtering, and restricting access
    """
    queryset = StaffAppraisal.objects.all()
    serializer_class = StaffAppraisalSerializer
    permission_classes = [IsAuthenticated, AppraisalAccessPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]

    search_fields = [
        "employee__username", "employee__first_name", "employee__last_name",
        "appraiser__username", "appraiser__first_name", "appraiser__last_name",
        "achievements", "development_needs", "goals",
    ]
    ordering_fields = [
        "date_of_appraisal", "created_at",
        "attendance_rating", "quality_rating",
        "teamwork_rating", "initiative_rating",
        "customer_service_rating", "adherence_rating",
    ]
    ordering = ["-date_of_appraisal"]

    def get_queryset(self):
        """
        Restrict queryset based on user role and filters
        """
        qs = super().get_queryset()
        user = self.request.user

        if user.is_superuser or user.is_staff or getattr(user, "role", None) == "owner":
            base_qs = qs
        elif getattr(user, "role", None) == "staff":
            base_qs = qs.filter(Q(appraiser=user) | Q(employee=user))
        else:
            base_qs = qs.filter(employee=user)

        # Optional query params
        employee = self.request.query_params.get("employee")
        appraiser = self.request.query_params.get("appraiser")
        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")

        if employee:
            base_qs = base_qs.filter(employee_id=employee)
        if appraiser:
            base_qs = base_qs.filter(appraiser_id=appraiser)
        if date_from:
            base_qs = base_qs.filter(date_of_appraisal__gte=date_from)
        if date_to:
            base_qs = base_qs.filter(date_of_appraisal__lte=date_to)

        return base_qs

    def perform_create(self, serializer):
        """
        Only owners (or superusers) can create appraisals
        """
        user = self.request.user
        if not (user.is_superuser or getattr(user, "role", None) == "owner"):
            raise Response(
                {"error": "Only owners can create appraisals"},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer.save(appraiser=user)


# ---------------- CAFE CHECKLIST ----------------

class CafeChecklistViewSet(viewsets.ModelViewSet):
    serializer_class = CafeChecklistSerializer
    permission_classes = [IsOwnerOrStaffReadOnly]

    def get_queryset(self):
        qs = CafeChecklist.objects.all()

        date = self.request.query_params.get("date")
        if date:
            try:
                qs = qs.filter(date=date)
            except Exception:
                raise ValidationError({"date": "Invalid date format. Use YYYY-MM-DD."})

        user = self.request.user
        role = getattr(user, "role", None)

        if role == "owner":
            staff_id = self.request.query_params.get("staff")
            completed = self.request.query_params.get("completed")

            if staff_id:
                qs = qs.filter(updated_by_id=staff_id)

            if completed in ['true', 'false']:
                is_completed = completed == 'true'
                qs = qs.filter(completed=is_completed)

            return qs

        return qs.filter(updated_by=user)
    
    def perform_create(self, serializer):
        """Automatically set user fields when creating new checklist items"""
        serializer.save(
            created_by=self.request.user,
            updated_by=self.request.user
        )

    def perform_update(self, serializer):
        """Automatically set updated_by when updating checklist items"""
        serializer.save(updated_by=self.request.user)

    @action(detail=True, methods=["post"])
    def toggle(self, request, pk=None):
        checklist = self.get_object()
        checklist.completed = not checklist.completed
        checklist.updated_by = request.user
        checklist.save()
        return Response(self.get_serializer(checklist).data)

    @action(detail=False, methods=["post"])
    def create_checklist_batch(self, request):
        items_data = request.data.get('items', [])
        created_items = []

        for item_data in items_data:
            item, created = CafeChecklist.objects.get_or_create(
                date=item_data['date'],
                checklist_type=item_data['checklist_type'],
                item_id=item_data['item_id'],
                defaults={
                    'item_name': item_data['item_name'],
                    'completed': False,
                    'created_by': request.user,
                    'updated_by': request.user,
                }
            )

            if not created:
                item.updated_by = request.user
                item.save(update_fields=['updated_by'])

            created_items.append(item)

        serializer = CafeChecklistSerializer(created_items, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=["post"])
    def batch_toggle(self, request):
        """Toggle multiple items at once - useful for bulk operations"""
        item_ids = request.data.get('item_ids', [])
        
        if not item_ids:
            return Response(
                {"error": "item_ids is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        updated_items = []
        for item_id in item_ids:
            try:
                item = self.get_queryset().get(id=item_id)
                item.completed = not item.completed
                item.updated_by = request.user
                item.save()
                updated_items.append(item)
            except CafeChecklist.DoesNotExist:
                continue
        
        serializer = CafeChecklistSerializer(updated_items, many=True)
        return Response(serializer.data)
    
def sign_waiver(request):
    """
    Expects JSON: { "full_name": "...", "signature": "data:image/png;base64,..." }
    """
    import json
    body = json.loads(request.body.decode("utf-8"))
    full_name = body["full_name"]
    signature_data = body["signature"].split(",")[1]  # strip data:image/png;base64,
    signature_bytes = base64.b64decode(signature_data)

    # Create PDF in memory
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # Waiver text
    c.setFont("Helvetica", 12)
    c.drawString(50, height - 100, "Event Waiver Agreement")
    text = (
        "By signing this waiver, you agree to release the organizers "
        "from any liability for injuries or damages during the event."
    )
    c.drawString(50, height - 130, text)

    # Full name
    c.drawString(50, height - 180, f"Full Name: {full_name}")

    # Signature image
    sig_buffer = BytesIO(signature_bytes)
    c.drawImage(sig_buffer, 50, height - 300, width=200, height=80, mask='auto')

    # Date
    import datetime
    c.drawString(50, height - 330, f"Signed on: {datetime.date.today()}")

    c.showPage()
    c.save()

    buffer.seek(0)
    response = HttpResponse(buffer, content_type="application/pdf")
    response["Content-Disposition"] = f'attachment; filename="waiver_{full_name}.pdf"'
    return response

class WaiverViewSet(viewsets.ModelViewSet):
    queryset = Waiver.objects.all().order_by("-created_at")
    serializer_class = WaiverSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["post"], url_path="sign")
    def sign_waiver(self, request):
        """
        POST { full_name: "...", signature: "data:image/png;base64,..." }
        Returns a generated PDF file.
        """
        full_name = request.data.get("full_name")
        signature = request.data.get("signature")

        if not full_name or not signature:
            return Response(
                {"error": "Full name and signature are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create waiver entry
        waiver = Waiver.objects.create(
            full_name=full_name,
            signature=signature
            )

        # Decode signature image
        signature_data = signature.split(",")[1]  # strip "data:image/png;base64,"
        signature_bytes = base64.b64decode(signature_data)

        # Generate PDF
        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4

        # Title + text
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, height - 100, "Event Waiver Agreement")
        c.setFont("Helvetica", 12)
        waiver_text = (
            "By signing this waiver, you agree to release the organizers "
            "from any liability for injuries or damages sustained during the event."
        )
        c.drawString(50, height - 130, waiver_text)

        # Full name
        c.drawString(50, height - 180, f"Full Name: {full_name}")

        # Signature image
        sig_buffer = BytesIO(signature_bytes)
        c.drawImage(sig_buffer, 50, height - 260, width=200, height=80, mask="auto")

        # Date
        c.drawString(50, height - 360, f"Signed on: {datetime.date.today()}")

        c.showPage()
        c.save()
        buffer.seek(0)

        # Save PDF to model
        pdf_filename = f"waiver_{full_name.replace(' ', '_')}.pdf"
        waiver.pdf_file.save(pdf_filename, ContentFile(buffer.getvalue()))
        waiver.save()

        # Return the PDF response
        buffer.seek(0)
        return FileResponse(buffer, as_attachment=True, filename=pdf_filename)