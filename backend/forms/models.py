from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from .managers import UserManager
from django.conf import settings
from django.db.models import Avg, Sum, Count
from datetime import datetime, timedelta
from decimal import Decimal
import uuid
import secrets

class User(AbstractUser):
    """
    Custom User model with role-based access
    Extends Django's built-in User model
    """
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('marshal', 'Marshal'),
        ('reception', 'Reception'),
        ('party_host', 'Party Host'),
        ('cafe', 'Cafe'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='staff')
    phone = models.CharField(max_length=20, blank=True)
    hire_date = models.DateField(null=True, blank=True)
    is_active_employee = models.BooleanField(default=True)

    objects = UserManager()
    
    def __str__(self):
        return f"{self.username} ({self.role})"

class DailyInspection(models.Model):
    """
    Comprehensive daily safety inspection model
    Mirrors the PDF inspection report format
    """
    INSPECTION_DAY_CHOICES = [
        ('SAT', 'Saturday'),
        ('SUN', 'Sunday'),
        ('MON', 'Monday'),
        ('TUE', 'Tuesday'),
        ('WED', 'Wednesday'),
        ('THU', 'Thursday'),
        ('FRI', 'Friday'),
    ]
    
    STATUS_CHOICES = [
        ('pass', 'Pass'),
        ('fail', 'Fail'),
        ('remedial', 'Remedial'),
    ]
    
    # Basic information
    date = models.DateField(default=timezone.now)
    wc_number = models.CharField(max_length=50, blank=True, help_text="WC number from the form")
    inspector_initials = models.CharField(max_length=5, help_text="Inspector initials")
    manager_initials = models.CharField(max_length=5, help_text="Manager initials for sign-off")
    
    # Individual inspection items - following the PDF format
    framework_stability = models.CharField(max_length=8, choices=STATUS_CHOICES, default='pass', help_text="INS001: Framework Stability & Security")
    perimeter_netting = models.CharField(max_length=8, choices=STATUS_CHOICES, default='pass', help_text="INS002: Perimeter Netting")
    wall_padding = models.CharField(max_length=8, choices=STATUS_CHOICES, default='pass', help_text="INS003: Protective Wall Padding")
    walkway_padding = models.CharField(max_length=8, choices=STATUS_CHOICES, default='pass', help_text="INS004: Protective Walkway Padding")
    coverall_pads = models.CharField(max_length=8, choices=STATUS_CHOICES, default='pass', help_text="INS005: Coverall Pads")
    trampoline_beds = models.CharField(max_length=8, choices=STATUS_CHOICES, default='pass', help_text="INS006: Trampoline Beds")
    safety_netting = models.CharField(max_length=8, choices=STATUS_CHOICES, default='pass', help_text="INS007: Trampoline Safety Netting")
    trampoline_springs = models.CharField(max_length=8, choices=STATUS_CHOICES, default='pass', help_text="INS008: Trampoline Springs")
    fire_doors = models.CharField(max_length=8, choices=STATUS_CHOICES, default='pass', help_text="INS009: Fire Doors Functioning & Routes Clear")
    fire_equipment = models.CharField(max_length=8, choices=STATUS_CHOICES, default='pass', help_text="INS010: Fire Extinguishing Equipment In Place")
    electrical_cables = models.CharField(max_length=8, choices=STATUS_CHOICES, default='pass', help_text="INS011: Electrical Cables Safely Routed")
    electrical_sockets = models.CharField(max_length=8, choices=STATUS_CHOICES, default='pass', help_text="INS012: Electrical plugs and sockets in good condition")
    first_aid_box = models.CharField(max_length=8, choices=STATUS_CHOICES, default='pass', help_text="INS013: First-aid box fully stocked")
    signage = models.CharField(max_length=8, choices=STATUS_CHOICES, default='pass', help_text="INS014: Signage in place and visible")
    area_cleanliness = models.CharField(max_length=8, choices=STATUS_CHOICES, default='pass', help_text="INS015: Area clean and ready for use")
    gates_locks = models.CharField(max_length=8, choices=STATUS_CHOICES, default='pass', help_text="INS016: Gates, closing and locking devices operational")
    trip_hazards = models.CharField(max_length=8, choices=STATUS_CHOICES, default='pass', help_text="INS017: Area free of trip/slip hazards")
    staff_availability = models.CharField(max_length=8, choices=STATUS_CHOICES, default='pass', help_text="INS018: Minimum required staff available")
    
    # Metadata
    checked_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='daily_inspections')
    signed_off_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='signed_inspections', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = "Daily Inspection"
        verbose_name_plural = "Daily Inspections"

    def __str__(self):
        return f"Daily Inspection - {self.inspection_day} - {self.date}"

    @property
    def overall_pass(self):
        """Calculate overall pass status based on individual items"""
        inspection_fields = [
            self.framework_stability, self.perimeter_netting, self.wall_padding,
            self.walkway_padding, self.coverall_pads, self.trampoline_beds,
            self.safety_netting, self.trampoline_springs, self.fire_doors,
            self.fire_equipment, self.electrical_cables, self.electrical_sockets,
            self.first_aid_box, self.signage, self.area_cleanliness,
            self.gates_locks, self.trip_hazards, self.staff_availability
        ]
        return all(status == 'pass' for status in inspection_fields)

    @property
    def failed_items_count(self):
        """Count of failed inspection items"""
        inspection_fields = [
            self.framework_stability, self.perimeter_netting, self.wall_padding,
            self.walkway_padding, self.coverall_pads, self.trampoline_beds,
            self.safety_netting, self.trampoline_springs, self.fire_doors,
            self.fire_equipment, self.electrical_cables, self.electrical_sockets,
            self.first_aid_box, self.signage, self.area_cleanliness,
            self.gates_locks, self.trip_hazards, self.staff_availability
        ]
        return sum(1 for status in inspection_fields if status == 'fail')

    @property
    def remedial_items_count(self):
        """Count of remedial inspection items"""
        inspection_fields = [
            self.framework_stability, self.perimeter_netting, self.wall_padding,
            self.walkway_padding, self.coverall_pads, self.trampoline_beds,
            self.safety_netting, self.trampoline_springs, self.fire_doors,
            self.fire_equipment, self.electrical_cables, self.electrical_sockets,
            self.first_aid_box, self.signage, self.area_cleanliness,
            self.gates_locks, self.trip_hazards, self.staff_availability
        ]
        return sum(1 for status in inspection_fields if status == 'remedial')

    def get_failed_items(self):
        """Return list of failed inspection items with their codes"""
        item_mapping = {
            'framework_stability': 'INS001',
            'perimeter_netting': 'INS002',
            'wall_padding': 'INS003',
            'walkway_padding': 'INS004',
            'coverall_pads': 'INS005',
            'trampoline_beds': 'INS006',
            'safety_netting': 'INS007',
            'trampoline_springs': 'INS008',
            'fire_doors': 'INS009',
            'fire_equipment': 'INS010',
            'electrical_cables': 'INS011',
            'electrical_sockets': 'INS012',
            'first_aid_box': 'INS013',
            'signage': 'INS014',
            'area_cleanliness': 'INS015',
            'gates_locks': 'INS016',
            'trip_hazards': 'INS017',
            'staff_availability': 'INS018',
        }
        
        failed_items = []
        for field_name, code in item_mapping.items():
            if getattr(self, field_name) == 'fail':
                failed_items.append((code, field_name))
        return failed_items


class RemedialAction(models.Model):
    """
    Tracks remedial actions for failed or flagged inspection items
    """
    inspection = models.ForeignKey(DailyInspection, on_delete=models.CASCADE, related_name='remedial_actions')
    inspection_code = models.CharField(max_length=6, help_text="Inspection code (e.g., INS001)")
    issue_description = models.TextField(help_text="Description of the issue found")
    remedial_action = models.TextField(help_text="Action taken or required")
    
    # Status tracking
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('escalated', 'Escalated'),
    ]
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='pending')
    
    # Personnel
    reported_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reported_remedial_actions')
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_remedial_actions', null=True, blank=True)
    completed_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='completed_remedial_actions', null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Remedial Action"
        verbose_name_plural = "Remedial Actions"

    def __str__(self):
        return f"Remedial Action - {self.inspection_code} - {self.inspection.date}"


# Keep the simplified SafetyCheck model for backward compatibility if needed
class SafetyCheck(models.Model):
    """
    Simplified safety inspection model (kept for backward compatibility)
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
    total_revenue = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="Total daily revenue")
    bounce_time_minutes = models.IntegerField(default=0, help_text="Total bounce time in minutes")
    peak_hour_start = models.TimeField(null=True, blank=True, help_text="Peak hour start time")
    peak_hour_end = models.TimeField(null=True, blank=True, help_text="Peak hour end time")
    notes = models.TextField(blank=True, help_text="Daily notes or observations")
    recorded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
        verbose_name = "Daily Stats"
        verbose_name_plural = "Daily Stats"

    def __str__(self):
        return f"Stats - {self.date} - {self.visitor_count} visitors - £{self.cafe_sales}"
    
    @classmethod
    def get_monthly_revenue(cls, month=None, year=None):
        """Calculate monthly revenue"""
        if not month:
            month = timezone.now().month
        if not year:
            year = timezone.now().year
            
        return cls.objects.filter(
            date__month=month,
            date__year=year
        ).aggregate(
            total=Sum('total_revenue')
        )['total'] or Decimal('0')

    @classmethod
    def get_monthly_visitors(cls, month=None, year=None):
        """Calculate monthly visitors"""
        if not month:
            month = timezone.now().month
        if not year:
            year = timezone.now().year
            
        return cls.objects.filter(
            date__month=month,
            date__year=year
        ).aggregate(
            total=Sum('visitor_count')
        )['total'] or 0

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

class MarshalChecklist(models.Model):
    CHECKLIST_TYPES = [
        ('pre_shift', 'Pre-Shift Marshal Checklist'),
        ('shift_operations', 'Shift Operations Checklist'),
        ('post_shift', 'Post-Shift Marshal Checklist'),
    ]
    
    date = models.DateField()
    checklist_type = models.CharField(max_length=50, choices=CHECKLIST_TYPES, null=True, blank=True)
    item_id = models.CharField(max_length=100, null=True, blank=True)
    item_name = models.CharField(max_length=255, null=True, blank=True)
    completed = models.BooleanField(default=False, null=True, blank=True)
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="marshal_checklist_creators"
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="marshal_checklist_updates"
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

    def get_average_rating(self):
        """Calculate average rating across all categories"""
        ratings = [
            self.attendance_rating,
            self.quality_rating,
            self.teamwork_rating,
            self.initiative_rating,
            self.customer_service_rating,
            self.adherence_rating
        ]
        return sum(ratings) / len(ratings)

class CustomerSatisfactionSurvey(models.Model):
    """
    Customer satisfaction surveys for analytics
    """
    date = models.DateTimeField(auto_now_add=True)
    overall_rating = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    cleanliness_rating = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    staff_rating = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    facilities_rating = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    value_rating = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    comments = models.TextField(blank=True)
    would_recommend = models.BooleanField()
    
    class Meta:
        ordering = ['-date']
        
    def __str__(self):
        return f"Survey - {self.date.strftime('%Y-%m-%d')} - Rating: {self.overall_rating}"

class BusinessTarget(models.Model):
    """
    Business targets for analytics tracking
    """
    TARGET_TYPES = [
        ('revenue', 'Monthly Revenue'),
        ('visitors', 'Monthly Visitors'),
        ('satisfaction', 'Customer Satisfaction'),
        ('incidents', 'Safety Incidents'),
    ]
    
    target_type = models.CharField(max_length=20, choices=TARGET_TYPES)
    target_value = models.DecimalField(max_digits=10, decimal_places=2)
    month = models.IntegerField()
    year = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['target_type', 'month', 'year']
        
    def __str__(self):
        return f"{self.get_target_type_display()} - {self.month}/{self.year} - Target: {self.target_value}"
    
class WaiverSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    staff = models.ForeignKey(User, on_delete=models.CASCADE, related_name='waiver_sessions')
    participant_email = models.EmailField(blank=True, null=True)
    participant_name = models.CharField(max_length=255, blank=True, null=True)
    token = models.CharField(max_length=64, unique=True, editable=False)
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        if not self.token:
            self.token = secrets.token_urlsafe(48)
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(days=7)
        super().save(*args, **kwargs)
    
    def is_valid(self):
        return not self.is_used and timezone.now() < self.expires_at

    def __str__(self):
        return f"WaiverSession {self.token}"

class Waiver(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.OneToOneField(WaiverSession, on_delete=models.CASCADE, related_name='waiver', null=True, blank=True)
    full_name = models.CharField(max_length=255)
    signature = models.TextField()
    pdf_file = models.FileField(upload_to="waivers/%Y/%m/%d/", null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    signed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-signed_at']

    def __str__(self):
        return f"Waiver for {self.full_name}"