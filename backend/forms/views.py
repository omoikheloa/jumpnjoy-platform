from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from django.contrib.auth import login
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta
from .models import (
    User, SafetyCheck, IncidentReport, StaffShift, CleaningLog,
    MaintenanceLog, DailyStats, StaffAppraisal, CafeChecklist
)
from .permissions import AppraisalAccessPermission
from .serializers import (
    UserSerializer, AuthSerializer, SafetyCheckSerializer, IncidentReportSerializer,
    StaffShiftSerializer, CleaningLogSerializer, MaintenanceLogSerializer,
    DailyStatsSerializer, StaffAppraisalSerializer, CafeChecklistSerializer
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


# ---------------- SAFETY ----------------

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
    queryset = StaffAppraisal.objects.all()
    serializer_class = StaffAppraisalSerializer
    permission_classes = [IsAuthenticated, AppraisalAccessPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "employee__username", "employee__first_name", "employee__last_name",
        "appraiser__username", "appraiser__first_name", "appraiser__last_name",
        "achievements", "development_needs", "goals"
    ]
    ordering_fields = [
        "date_of_appraisal", "created_at",
        "attendance_rating", "quality_rating",
        "teamwork_rating", "initiative_rating",
        "customer_service_rating", "adherence_rating",
    ]
    ordering = ["-date_of_appraisal"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user

        if user.is_superuser or user.is_staff:
            base_qs = qs
        else:
            role = getattr(user, "role", None)
            if role == "staff":
                base_qs = qs.filter(Q(appraiser=user) | Q(employee=user))
            else:
                base_qs = qs.filter(employee=user)

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