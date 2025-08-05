from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    """
    Custom User model with role-based access
    Extends Django's built-in User model
    """
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('staff', 'Staff'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='staff')
    
    def __str__(self):
        return f"{self.username} ({self.role})"

class SafetyCheck(models.Model):
    """
    Daily safety inspection model
    Tracks equipment condition and safety compliance
    """
    date = models.DateField(default=timezone.now)
    trampoline_id = models.CharField(max_length=50, help_text="Trampoline identifier")
    springs_ok = models.BooleanField(default=True, help_text="Springs in good condition")
    nets_ok = models.BooleanField(default=True, help_text="Safety nets intact")
    foam_pits_ok = models.BooleanField(default=True, help_text="Foam pits properly maintained")
    overall_pass = models.BooleanField(default=True, help_text="Overall safety check passed")
    notes = models.TextField(blank=True, help_text="Additional observations")
    checked_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
        verbose_name = "Safety Check"
        verbose_name_plural = "Safety Checks"

    def __str__(self):
        return f"Safety Check - {self.trampoline_id} - {self.date}"

class IncidentReport(models.Model):
    """
    Incident and accident reporting model
    Legal requirement for tracking incidents
    """
    INCIDENT_TYPES = [
        ('injury', 'Injury'),
        ('equipment_fault', 'Equipment Fault'),
        ('other', 'Other'),
    ]
    
    date = models.DateTimeField(default=timezone.now)
    incident_type = models.CharField(max_length=20, choices=INCIDENT_TYPES)
    description = models.TextField(help_text="Detailed description of incident")
    location = models.CharField(max_length=100, help_text="Where incident occurred")
    injured_person = models.CharField(max_length=100, blank=True, help_text="Name of injured person if applicable")
    action_taken = models.TextField(help_text="Actions taken in response")
    reported_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
        verbose_name = "Incident Report"
        verbose_name_plural = "Incident Reports"

    def __str__(self):
        return f"Incident - {self.incident_type} - {self.date.strftime('%Y-%m-%d %H:%M')}"

class StaffShift(models.Model):
    """
    Staff scheduling and duty tracking
    Ensures proper staffing levels and compliance
    """
    date = models.DateField(default=timezone.now)
    staff_member = models.ForeignKey(User, on_delete=models.CASCADE)
    start_time = models.TimeField(help_text="Shift start time")
    end_time = models.TimeField(null=True, blank=True, help_text="Shift end time")
    role_during_shift = models.CharField(max_length=50, help_text="Role/position during shift")
    notes = models.TextField(blank=True, help_text="Shift notes or observations")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
        verbose_name = "Staff Shift"
        verbose_name_plural = "Staff Shifts"

    def __str__(self):
        return f"{self.staff_member.username} - {self.date} - {self.role_during_shift}"

class CleaningLog(models.Model):
    """
    Cleaning and sanitation tracking
    Health department compliance requirement
    """
    AREA_CHOICES = [
        ('restrooms', 'Restrooms'),
        ('common_areas', 'Common Areas'),
        ('trampolines', 'Trampoline Areas'),
        ('cafe', 'Cafe'),
        ('entrance', 'Entrance'),
    ]
    
    date = models.DateTimeField(default=timezone.now)
    area = models.CharField(max_length=20, choices=AREA_CHOICES)
    task_completed = models.BooleanField(default=True, help_text="Cleaning task completed")
    supplies_used = models.CharField(max_length=200, blank=True, help_text="Cleaning supplies used")
    notes = models.TextField(blank=True, help_text="Additional cleaning notes")
    cleaned_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
        verbose_name = "Cleaning Log"
        verbose_name_plural = "Cleaning Logs"

    def __str__(self):
        return f"Cleaning - {self.area} - {self.date.strftime('%Y-%m-%d %H:%M')}"

class MaintenanceLog(models.Model):
    """
    Equipment maintenance tracking
    Preventive maintenance and repair history
    """
    MAINTENANCE_TYPES = [
        ('routine', 'Routine Maintenance'),
        ('repair', 'Repair'),
        ('inspection', 'Inspection'),
    ]
    
    date = models.DateTimeField(default=timezone.now)
    equipment_id = models.CharField(max_length=50, help_text="Equipment identifier")
    maintenance_type = models.CharField(max_length=20, choices=MAINTENANCE_TYPES)
    description = models.TextField(help_text="Description of maintenance performed")
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Cost of maintenance")
    next_maintenance_due = models.DateField(null=True, blank=True, help_text="Next scheduled maintenance")
    performed_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
        verbose_name = "Maintenance Log"
        verbose_name_plural = "Maintenance Logs"

    def __str__(self):
        return f"Maintenance - {self.equipment_id} - {self.maintenance_type} - {self.date.strftime('%Y-%m-%d')}"

class DailyStats(models.Model):
    """
    Daily business statistics
    Visitor counts and sales tracking for analytics
    """
    date = models.DateField(unique=True, default=timezone.now, help_text="Date for statistics")
    visitor_count = models.IntegerField(default=0, help_text="Total visitors for the day")
    cafe_sales = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="Cafe sales amount")
    notes = models.TextField(blank=True, help_text="Daily notes or observations")
    recorded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
        verbose_name = "Daily Stats"
        verbose_name_plural = "Daily Stats"

    def __str__(self):
        return f"Stats - {self.date} - {self.visitor_count} visitors - £{self.cafe_sales}"
