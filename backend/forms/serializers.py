# serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.hashers import make_password
from .models import (
    SafetyCheck, IncidentReport, StaffShift, CleaningLog, 
    MaintenanceLog, DailyStats, CafeChecklist, StaffAppraisal,
    CustomerSatisfactionSurvey, BusinessTarget, DailyInspection, RemedialAction, Waiver, WaiverSession
)

User = get_user_model()

# -----------------------
# User & Authentication
# -----------------------

class UserSerializer(serializers.ModelSerializer):
    """
    User serializer for user management
    """
    password = serializers.CharField(write_only=True, required=False)
    confirm_password = serializers.CharField(write_only=True, required=False)
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'phone', 'hire_date', 'is_active_employee',
            'password', 'confirm_password', 'full_name', 'date_joined',
            'last_login', 'is_active'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login', 'full_name']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()
    
    def validate(self, attrs):
        if 'password' in attrs and 'confirm_password' in attrs:
            if attrs['password'] != attrs['confirm_password']:
                raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        validated_data.pop('confirm_password', None)
        if 'password' in validated_data and validated_data['password']:
            validated_data['password'] = make_password(validated_data['password'])
        elif 'password' in validated_data and not validated_data['password']:
            validated_data.pop('password')
        return super().update(instance, validated_data)


class AuthSerializer(serializers.Serializer):
    """
    Authentication serializer for login
    Validates credentials and returns user object
    """
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
            return attrs
        raise serializers.ValidationError('Username and password required')

# -----------------------
# Daily Stats
# -----------------------

class DailyStatsSerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.CharField(source='recorded_by.username', read_only=True)
    
    class Meta:
        model = DailyStats
        fields = [
            'id', 'date', 'visitor_count', 'cafe_sales', 'total_revenue',
            'bounce_time_minutes', 'peak_hour_start', 'peak_hour_end',
            'notes', 'recorded_by', 'recorded_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'recorded_by', 'recorded_by_name', 'created_at']

    def validate_visitor_count(self, value):
        if value < 0:
            raise serializers.ValidationError("Visitor count cannot be negative")
        if value > 1000:
            raise serializers.ValidationError("Visitor count seems unusually high")
        return value

    def validate_cafe_sales(self, value):
        if value < 0:
            raise serializers.ValidationError("Sales amount cannot be negative")
        return value

# -----------------------
# Safety Check
# -----------------------

class RemedialActionSerializer(serializers.ModelSerializer):
    reported_by_name = serializers.CharField(source='reported_by.get_full_name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    completed_by_name = serializers.CharField(source='completed_by.get_full_name', read_only=True)
    
    class Meta:
        model = RemedialAction
        fields = [
            'id', 'inspection_code', 'issue_description', 'remedial_action',
            'status', 'reported_by', 'reported_by_name', 'assigned_to', 'assigned_to_name',
            'completed_by', 'completed_by_name', 'created_at', 'due_date', 'completed_at'
        ]
        read_only_fields = ['id', 'created_at']

class DailyInspectionSerializer(serializers.ModelSerializer):
    remedial_actions = RemedialActionSerializer(many=True, read_only=True)
    checked_by_name = serializers.CharField(source='checked_by.get_full_name', read_only=True)
    signed_off_by_name = serializers.CharField(source='signed_off_by.get_full_name', read_only=True)
    overall_pass = serializers.BooleanField(read_only=True)
    failed_items_count = serializers.IntegerField(read_only=True)
    remedial_items_count = serializers.IntegerField(read_only=True)
    failed_items = serializers.JSONField(source='get_failed_items', read_only=True)
    date = serializers.DateField()
    
    # Remedial notes field for handling frontend data
    remedial_notes = serializers.JSONField(write_only=True, required=False)
    
    class Meta:
        model = DailyInspection
        fields = [
            'id', 'date', 'wc_number', 'inspector_initials', 'manager_initials',
            'framework_stability', 'perimeter_netting', 'wall_padding', 'walkway_padding',
            'coverall_pads', 'trampoline_beds', 'safety_netting', 'trampoline_springs',
            'fire_doors', 'fire_equipment', 'electrical_cables', 'electrical_sockets',
            'first_aid_box', 'signage', 'area_cleanliness', 'gates_locks', 'trip_hazards',
            'staff_availability', 'checked_by', 'checked_by_name', 'signed_off_by', 
            'signed_off_by_name', 'created_at', 'updated_at', 'overall_pass',
            'failed_items_count', 'remedial_items_count', 'failed_items',
            'remedial_actions', 'remedial_notes'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        # Extract remedial notes from the validated data
        remedial_notes = validated_data.pop('remedial_notes', {})
        
        # Create the inspection record
        inspection = DailyInspection.objects.create(**validated_data)
        
        # Create remedial action records for failed/remedial items with notes
        self._create_remedial_actions(inspection, remedial_notes)
        
        return inspection

    def update(self, instance, validated_data):
        # Extract remedial notes from the validated data
        remedial_notes = validated_data.pop('remedial_notes', {})
        
        # Update the inspection record
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update or create remedial action records
        self._create_remedial_actions(instance, remedial_notes, update=True)
        
        return instance

    def _create_remedial_actions(self, inspection, remedial_notes, update=False):
        """Create or update remedial action records for failed/remedial items"""
        if update:
            # Clear existing remedial actions for this inspection
            inspection.remedial_actions.all().delete()
        
        # Mapping of field names to inspection codes
        field_to_code = {
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
        
        # Create remedial actions for items that failed or need remedial work
        for field_name, inspection_code in field_to_code.items():
            field_value = getattr(inspection, field_name)
            
            if field_value in ['fail', 'remedial'] and inspection_code in remedial_notes:
                note = remedial_notes[inspection_code]
                if note.strip():  # Only create if there's actually a note
                    RemedialAction.objects.create(
                        inspection=inspection,
                        inspection_code=inspection_code,
                        issue_description=note,
                        remedial_action=note,  # For now, same as description
                        status='pending' if field_value == 'remedial' else 'escalated',
                        reported_by=inspection.checked_by
                    )

class SafetyCheckSerializer(serializers.ModelSerializer):
    """Safety Check serializer for trampoline inspections
    """
    checked_by_name = serializers.CharField(source='checked_by.username', read_only=True)
    
    class Meta:
        model = SafetyCheck
        fields = [
            'id', 'date', 'trampoline_id', 'springs_ok', 'nets_ok',
            'foam_pits_ok', 'overall_pass', 'notes', 'checked_by',
            'checked_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'checked_by', 'checked_by_name', 'created_at']

    def validate(self, attrs):
        if not all([attrs.get('springs_ok', True), 
                    attrs.get('nets_ok', True), 
                    attrs.get('foam_pits_ok', True)]):
            attrs['overall_pass'] = False
        return attrs

# -----------------------
# Incident Report
# -----------------------

class IncidentReportSerializer(serializers.ModelSerializer):
    reported_by_name = serializers.CharField(source='reported_by.username', read_only=True)
    age = serializers.SerializerMethodField()
    
    class Meta:
        model = IncidentReport
        fields = [
            'id', 'first_name', 'surname', 'date_of_birth', 'age', 'gender',
            'address', 'postcode', 'phone_home', 'phone_mobile',
            'consent_to_treatment', 'refusal_of_treatment', 'guardian_name',
            'date_of_accident', 'time_of_accident', 'location', 'how_occurred',
            'injury_details', 'injury_location', 'treatment_given', 'hospital',
            'time_departure', 'destination', 'ambulance_called',
            'ambulance_time_called', 'ambulance_caller', 'ambulance_time_arrived',
            'continued_activities_time', 'first_aider_name', 'first_aider_signature',
            'first_aider_date', 'first_aider_time', 'riddor_reportable',
            'riddor_report_method', 'riddor_reported_by', 'riddor_date_reported',
            'reported_by', 'reported_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'reported_by', 'reported_by_name', 'created_at', 'age']
    
    def get_age(self, obj):
        if obj.date_of_birth and obj.date_of_accident:
            return (obj.date_of_accident - obj.date_of_birth).days // 365
        return None

    def validate_how_occurred(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Description must be at least 10 characters long")
        return value

# -----------------------
# Staff Shift
# -----------------------

class StaffShiftSerializer(serializers.ModelSerializer):
    staff_member_name = serializers.CharField(source='staff_member.username', read_only=True)
    duration = serializers.SerializerMethodField()
    
    class Meta:
        model = StaffShift
        fields = [
            'id', 'date', 'staff_member', 'staff_member_name', 'start_time',
            'end_time', 'role_during_shift', 'notes', 'duration', 'created_at'
        ]
        read_only_fields = ['id', 'staff_member_name', 'duration', 'created_at']
    
    def get_duration(self, obj):
        if obj.start_time and obj.end_time:
            from datetime import datetime, timedelta
            start = datetime.combine(obj.date, obj.start_time)
            end = datetime.combine(obj.date, obj.end_time)
            if end < start:
                end += timedelta(days=1)
            duration = end - start
            hours = duration.seconds // 3600
            minutes = (duration.seconds % 3600) // 60
            return f"{hours}h {minutes}m"
        return None

    def validate(self, attrs):
        start_time = attrs.get('start_time')
        end_time = attrs.get('end_time')
        if end_time and start_time and end_time <= start_time:
            raise serializers.ValidationError("End time must be after start time")
        return attrs

# -----------------------
# Cleaning & Maintenance
# -----------------------

class CleaningLogSerializer(serializers.ModelSerializer):
    cleaned_by_name = serializers.CharField(source='cleaned_by.username', read_only=True)
    area_display = serializers.CharField(source='get_area_display', read_only=True)
    
    class Meta:
        model = CleaningLog
        fields = [
            'id', 'date', 'area', 'area_display', 'task_completed',
            'supplies_used', 'notes', 'cleaned_by', 'cleaned_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'cleaned_by', 'cleaned_by_name', 'area_display', 'created_at']


class MaintenanceLogSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(source='performed_by.username', read_only=True)
    maintenance_type_display = serializers.CharField(source='get_maintenance_type_display', read_only=True)
    
    class Meta:
        model = MaintenanceLog
        fields = [
            'id', 'date', 'equipment_id', 'maintenance_type', 'maintenance_type_display',
            'description', 'cost', 'next_maintenance_due', 'performed_by',
            'performed_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'performed_by', 'performed_by_name', 'maintenance_type_display', 'created_at']

    def validate_cost(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Cost cannot be negative")
        return value

# -----------------------
# Cafe Checklist
# -----------------------

class CafeChecklistSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    updated_by_name = serializers.CharField(source='updated_by.username', read_only=True)
    checklist_type_display = serializers.CharField(source='get_checklist_type_display', read_only=True)
    
    class Meta:
        model = CafeChecklist
        fields = [
            'id', 'date', 'checklist_type', 'checklist_type_display', 'item_id',
            'item_name', 'completed', 'created_by', 'created_by_name',
            'updated_by', 'updated_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_by', 'updated_by', 'created_by_name', 
            'updated_by_name', 'checklist_type_display', 'created_at', 'updated_at'
        ]

# -----------------------
# Staff Appraisal
# -----------------------

class StaffAppraisalSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.username', read_only=True)
    appraiser_name = serializers.CharField(source='appraiser.username', read_only=True)
    average_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = StaffAppraisal
        fields = [
            'id', 'employee', 'employee_name', 'appraiser', 'appraiser_name',
            'date_of_appraisal', 'attendance_rating', 'attendance_comments',
            'quality_rating', 'quality_comments', 'teamwork_rating',
            'teamwork_comments', 'initiative_rating', 'initiative_comments',
            'customer_service_rating', 'customer_service_comments',
            'adherence_rating', 'adherence_comments', 'achievements',
            'development_needs', 'goals', 'employee_comments',
            'average_rating', 'created_at'
        ]
        read_only_fields = [
            'id', 'appraiser', 'employee_name', 'appraiser_name', 
            'average_rating', 'created_at'
        ]
    
    def get_average_rating(self, obj):
        return round(obj.get_average_rating(), 1)

# -----------------------
# Customer Satisfaction
# -----------------------

class CustomerSatisfactionSurveySerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerSatisfactionSurvey
        fields = [
            'id', 'date', 'overall_rating', 'cleanliness_rating',
            'staff_rating', 'facilities_rating', 'value_rating',
            'comments', 'would_recommend'
        ]
        read_only_fields = ['id', 'date']

# -----------------------
# Business Target
# -----------------------

class BusinessTargetSerializer(serializers.ModelSerializer):
    target_type_display = serializers.CharField(source='get_target_type_display', read_only=True)
    
    class Meta:
        model = BusinessTarget
        fields = [
            'id', 'target_type', 'target_type_display', 'target_value',
            'month', 'year', 'created_at'
        ]
        read_only_fields = ['id', 'target_type_display', 'created_at']

class WaiverSessionSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff.get_full_name', read_only=True)
    waiver_link = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = WaiverSession
        fields = ['id', 'staff_name', 'participant_email', 'participant_name', 
                 'token', 'is_used', 'expires_at', 'created_at', 'waiver_link', 'status']
        read_only_fields = ['id', 'token', 'created_at']

    def get_waiver_link(self, obj):
        request = self.context.get('request')
        if request and obj.token:
            return f"{request.scheme}://{request.get_host()}/waiver/{obj.token}/"
        return None

    def get_status(self, obj):
        if obj.is_used:
            return "Signed"
        elif not obj.is_valid():
            return "Expired"
        return "Pending"

class WaiverSessionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WaiverSession
        fields = ['participant_email', 'participant_name']

class WaiverSignSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=255)
    signature = serializers.CharField()

    def validate_full_name(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Full name must be at least 2 characters long.")
        return value.strip()

class WaiverSerializer(serializers.ModelSerializer):
    session = WaiverSessionSerializer(read_only=True)
    pdf_url = serializers.SerializerMethodField()

    class Meta:
        model = Waiver
        fields = ['id', 'session', 'full_name', 'pdf_file', 'pdf_url', 
                 'ip_address', 'signed_at']
        read_only_fields = ['id', 'session', 'pdf_file', 'ip_address', 'signed_at']

    def get_pdf_url(self, obj):
        if obj.pdf_file:
            return obj.pdf_file.url
        return None