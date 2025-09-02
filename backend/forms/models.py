from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from .managers import UserManager
from django.conf import settings

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

    objects = UserManager()
    
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
    Accident and incident reporting model
    Based on JUMP N JOY Accident Report Form
    """
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
    ]

    # Injured Person Details
    first_name = models.CharField(max_length=100)
    surname = models.CharField(max_length=100)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)
    address = models.CharField(max_length=255, blank=True)
    postcode = models.CharField(max_length=20, blank=True)
    phone_home = models.CharField(max_length=20, blank=True)
    phone_mobile = models.CharField(max_length=20, blank=True)

    consent_to_treatment = models.BooleanField(default=False)
    refusal_of_treatment = models.BooleanField(default=False)
    guardian_name = models.CharField(max_length=100, blank=True)

    # Accident Details
    date_of_accident = models.DateField()
    time_of_accident = models.TimeField()
    location = models.CharField(max_length=255)
    how_occurred = models.TextField()
    injury_details = models.TextField(blank=True)
    injury_location = models.CharField(max_length=255, blank=True)

    # Treatment
    treatment_given = models.TextField(blank=True)
    hospital = models.CharField(max_length=255, blank=True)
    time_departure = models.TimeField(null=True, blank=True)
    destination = models.CharField(max_length=255, blank=True)
    ambulance_called = models.BooleanField(default=False)
    ambulance_time_called = models.TimeField(null=True, blank=True)
    ambulance_caller = models.CharField(max_length=100, blank=True)
    ambulance_time_arrived = models.TimeField(null=True, blank=True)

    continued_activities_time = models.TimeField(null=True, blank=True)

    # First Aider
    first_aider_name = models.CharField(max_length=100, blank=True)
    first_aider_signature = models.ImageField(
        upload_to="signatures/",
        blank=True,
        null=True,
        help_text="Digital signature of the first aider"
    )
    first_aider_date = models.DateField(null=True, blank=True)
    first_aider_time = models.TimeField(null=True, blank=True)

    # RIDDOR Section
    riddor_reportable = models.BooleanField(default=False)
    riddor_report_method = models.CharField(max_length=255, blank=True)
    riddor_reported_by = models.CharField(max_length=100, blank=True)
    riddor_date_reported = models.DateField(null=True, blank=True)

    reported_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_of_accident']
        verbose_name = "Accident Report"
        verbose_name_plural = "Accident Reports"

    def __str__(self):
        return f"Accident - {self.first_name} {self.surname} - {self.date_of_accident}"

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
    

class CafeChecklist(models.Model):
    CHECKLIST_TYPES = [
        ('opening', 'Opening Checklist'),
        ('midday', 'Midday Operations'),
        ('closing', 'Closing Checklist'),
    ]
    
    date = models.DateField()
    checklist_type = models.CharField(max_length=50, choices=CHECKLIST_TYPES, null=True, blank=True)
    item_id = models.CharField(max_length=100, null=True, blank=True)
    item_name = models.CharField(max_length=255, null=True, blank=True)
    completed = models.BooleanField(default=False, null=True, blank=True)
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="checklist_creators"
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="checklist_updates"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        # Prevent duplicate entries for same item on same date
        unique_together = ['date', 'checklist_type', 'item_id']
        ordering = ['checklist_type', 'item_id']
        
    def __str__(self):
        return f"{self.checklist_type} - {self.item_name} - {self.date}"
    
class StaffAppraisal(models.Model):
    """
    Staff Appraisal model based on appraisal form
    """

    RATING_CHOICES = [(i, str(i)) for i in range(1, 6)]  # 1 to 5 scale

    # Meta
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name="appraisals")
    appraiser = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="given_appraisals")
    date_of_appraisal = models.DateField()

    # Section 1: Job Performance
    attendance_rating = models.IntegerField(choices=RATING_CHOICES)
    attendance_comments = models.TextField(blank=True)

    quality_rating = models.IntegerField(choices=RATING_CHOICES)
    quality_comments = models.TextField(blank=True)

    teamwork_rating = models.IntegerField(choices=RATING_CHOICES)
    teamwork_comments = models.TextField(blank=True)

    initiative_rating = models.IntegerField(choices=RATING_CHOICES)
    initiative_comments = models.TextField(blank=True)

    customer_service_rating = models.IntegerField(choices=RATING_CHOICES)
    customer_service_comments = models.TextField(blank=True)

    adherence_rating = models.IntegerField(choices=RATING_CHOICES)
    adherence_comments = models.TextField(blank=True)

    # Section 2: Achievements
    achievements = models.TextField(blank=True)

    # Section 3: Development
    development_needs = models.TextField(blank=True)

    # Section 4: Goals
    goals = models.TextField(blank=True)

    # Comments
    employee_comments = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_of_appraisal']
        verbose_name = "Staff Appraisal"
        verbose_name_plural = "Staff Appraisals"

    def __str__(self):
        return f"Appraisal - {self.employee.username} ({self.date_of_appraisal})"
