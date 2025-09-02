from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import User, SafetyCheck, IncidentReport, StaffShift, CleaningLog, MaintenanceLog, DailyStats, StaffAppraisal

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    Custom User admin with role field
    """
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_active')
    list_filter = ('role', 'is_active', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    
    fieldsets = UserAdmin.fieldsets + (
        ('Role Information', {'fields': ('role',)}),
    )

@admin.register(SafetyCheck)
class SafetyCheckAdmin(admin.ModelAdmin):
    """
    Safety Check admin interface
    """
    list_display = ('trampoline_id', 'date', 'overall_pass', 'checked_by', 'created_at')
    list_filter = ('overall_pass', 'date', 'checked_by')
    search_fields = ('trampoline_id', 'notes')
    date_hierarchy = 'date'
    
    def get_queryset(self, request):
        """
        Filter based on user role
        """
        qs = super().get_queryset(request)
        if hasattr(request.user, 'role') and request.user.role == 'staff':
            return qs.filter(checked_by=request.user)
        return qs


@admin.register(IncidentReport)
class IncidentReportAdmin(admin.ModelAdmin):
    """
    Accident/Incident Report admin interface
    """
    list_display = (
        'first_name', 'surname', 'date_of_accident', 'time_of_accident',
        'location', 'reported_by', 'created_at', 'riddor_reportable'
    )
    list_filter = (
        'date_of_accident',
        'gender',
        'ambulance_called',
        'riddor_reportable',
        'reported_by',
    )
    search_fields = (
        'first_name', 'surname', 'location', 'how_occurred',
        'injury_details', 'treatment_given', 'first_aider_name'
    )
    date_hierarchy = 'date_of_accident'
    readonly_fields = ('created_at',)

    fieldsets = (
        ('Injured Person Details', {
            'fields': (
                'first_name', 'surname', 'date_of_birth', 'gender',
                'address', 'postcode', 'phone_home', 'phone_mobile',
                'consent_to_treatment', 'refusal_of_treatment', 'guardian_name',
            )
        }),
        ('Accident Details', {
            'fields': (
                'date_of_accident', 'time_of_accident', 'location',
                'how_occurred', 'injury_details', 'injury_location',
            )
        }),
        ('Treatment / Advice', {
            'fields': (
                'treatment_given', 'hospital', 'time_departure', 'destination',
                'ambulance_called', 'ambulance_time_called', 'ambulance_caller',
                'ambulance_time_arrived', 'continued_activities_time',
            )
        }),
        ('First Aider', {
            'fields': (
                'first_aider_name', 'first_aider_signature',
                'first_aider_date', 'first_aider_time',
            )
        }),
        ('RIDDOR Reporting', {
            'fields': (
                'riddor_reportable', 'riddor_report_method',
                'riddor_reported_by', 'riddor_date_reported',
            )
        }),
        ('Meta', {
            'fields': ('reported_by', 'created_at'),
        }),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if hasattr(request.user, 'role') and request.user.role == 'staff':
            return qs.filter(reported_by=request.user)
        return qs


@admin.register(StaffShift)
class StaffShiftAdmin(admin.ModelAdmin):
    """
    Staff Shift admin interface
    """
    list_display = ('staff_member', 'date', 'start_time', 'end_time', 'role_during_shift')
    list_filter = ('date', 'staff_member', 'role_during_shift')
    search_fields = ('staff_member__username', 'role_during_shift')
    date_hierarchy = 'date'

@admin.register(CleaningLog)
class CleaningLogAdmin(admin.ModelAdmin):
    """
    Cleaning Log admin interface
    """
    list_display = ('area', 'date', 'task_completed', 'cleaned_by', 'created_at')
    list_filter = ('area', 'task_completed', 'date', 'cleaned_by')
    search_fields = ('area', 'supplies_used', 'notes')
    date_hierarchy = 'date'

@admin.register(MaintenanceLog)
class MaintenanceLogAdmin(admin.ModelAdmin):
    """
    Maintenance Log admin interface
    """
    list_display = ('equipment_id', 'maintenance_type', 'date', 'cost', 'next_maintenance_due', 'performed_by')
    list_filter = ('maintenance_type', 'date', 'performed_by')
    search_fields = ('equipment_id', 'description')
    date_hierarchy = 'date'
    
    def colored_cost(self, obj):
        """
        Display cost with color coding
        """
        if obj.cost:
            if obj.cost > 100:
                return format_html('<span style="color: red;">£{}</span>', obj.cost)
            return format_html('<span style="color: green;">£{}</span>', obj.cost)
        return "No cost recorded"
    colored_cost.short_description = "Cost"

@admin.register(DailyStats)
class DailyStatsAdmin(admin.ModelAdmin):
    """
    Daily Stats admin interface
    """
    list_display = ('date', 'visitor_count', 'cafe_sales', 'recorded_by', 'created_at')
    list_filter = ('date', 'recorded_by')
    search_fields = ('notes',)
    date_hierarchy = 'date'
    
    def get_readonly_fields(self, request, obj=None):
        """
        Make date readonly for existing records to prevent duplicates
        """
        if obj:  # Editing existing record
            return self.readonly_fields + ('date',)
        return self.readonly_fields

@admin.register(StaffAppraisal)
class StaffAppraisalAdmin(admin.ModelAdmin):
    """
    Admin interface for Staff Appraisal
    """
    list_display = ('employee', 'appraiser', 'date_of_appraisal', 'created_at')
    list_filter = ('date_of_appraisal', 'appraiser')
    search_fields = ('employee__username', 'employee__first_name', 'employee__last_name', 'achievements', 'goals')
    date_hierarchy = 'date_of_appraisal'
    readonly_fields = ('created_at',)

    fieldsets = (
        ('Employee Info', {
            'fields': ('employee', 'appraiser', 'date_of_appraisal')
        }),
        ('Job Performance', {
            'fields': (
                ('attendance_rating', 'attendance_comments'),
                ('quality_rating', 'quality_comments'),
                ('teamwork_rating', 'teamwork_comments'),
                ('initiative_rating', 'initiative_comments'),
                ('customer_service_rating', 'customer_service_comments'),
                ('adherence_rating', 'adherence_comments'),
            )
        }),
        ('Achievements', {
            'fields': ('achievements',)
        }),
        ('Development Needs', {
            'fields': ('development_needs',)
        }),
        ('Goals', {
            'fields': ('goals',)
        }),
        ('Employee Comments', {
            'fields': ('employee_comments',)
        }),
        ('Meta', {
            'fields': ('created_at',)
        }),
    )