from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import User, SafetyCheck, IncidentReport, StaffShift, CleaningLog, MaintenanceLog, DailyStats

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
    Incident Report admin interface
    """
    list_display = ('incident_type', 'date', 'location', 'reported_by', 'created_at')
    list_filter = ('incident_type', 'date', 'reported_by')
    search_fields = ('description', 'location', 'injured_person')
    date_hierarchy = 'date'
    readonly_fields = ('created_at',)
    
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
