from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, SafetyCheck, IncidentReport, StaffShift, CleaningLog, MaintenanceLog, DailyStats, StaffAppraisal, CafeChecklist

class UserSerializer(serializers.ModelSerializer):
    """
    User serializer for API responses
    Excludes sensitive information like password
    """
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role')
        read_only_fields = ('id',)

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

class SafetyCheckSerializer(serializers.ModelSerializer):
    """
    Safety check serializer with additional computed fields
    """
    checked_by_name = serializers.CharField(source='checked_by.get_full_name', read_only=True)
    
    class Meta:
        model = SafetyCheck
        fields = '__all__'
        read_only_fields = ('checked_by', 'created_at')

    def validate(self, attrs):
        """
        Custom validation for safety checks
        """
        # If any component fails, overall should fail
        if not all([attrs.get('springs_ok', True), 
                   attrs.get('nets_ok', True), 
                   attrs.get('foam_pits_ok', True)]):
            attrs['overall_pass'] = False
        return attrs

class IncidentReportSerializer(serializers.ModelSerializer):
    """
    Incident report serializer with validation
    """
    reported_by_name = serializers.CharField(source='reported_by.get_full_name', read_only=True)
    
    class Meta:
        model = IncidentReport
        fields = '__all__'
        read_only_fields = ('reported_by', 'created_at')

    def validate_description(self, value):
        """
        Ensure incident description is detailed enough
        """
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Description must be at least 10 characters long")
        return value

class StaffShiftSerializer(serializers.ModelSerializer):
    """
    Staff shift serializer with time validation
    """
    staff_name = serializers.CharField(source='staff_member.get_full_name', read_only=True)
    
    class Meta:
        model = StaffShift
        fields = '__all__'
        read_only_fields = ('created_at',)

    def validate(self, attrs):
        """
        Validate shift times
        """
        start_time = attrs.get('start_time')
        end_time = attrs.get('end_time')
        
        if end_time and start_time and end_time <= start_time:
            raise serializers.ValidationError("End time must be after start time")
        return attrs

class CleaningLogSerializer(serializers.ModelSerializer):
    """
    Cleaning log serializer
    """
    cleaned_by_name = serializers.CharField(source='cleaned_by.get_full_name', read_only=True)
    
    class Meta:
        model = CleaningLog
        fields = '__all__'
        read_only_fields = ('cleaned_by', 'created_at')

class MaintenanceLogSerializer(serializers.ModelSerializer):
    """
    Maintenance log serializer with cost validation
    """
    performed_by_name = serializers.CharField(source='performed_by.get_full_name', read_only=True)
    
    class Meta:
        model = MaintenanceLog
        fields = '__all__'
        read_only_fields = ('performed_by', 'created_at')

    def validate_cost(self, value):
        """
        Validate maintenance cost
        """
        if value is not None and value < 0:
            raise serializers.ValidationError("Cost cannot be negative")
        return value

class DailyStatsSerializer(serializers.ModelSerializer):
    """
    Daily stats serializer with business logic validation
    """
    recorded_by_name = serializers.CharField(source='recorded_by.get_full_name', read_only=True)
    
    class Meta:
        model = DailyStats
        fields = '__all__'
        read_only_fields = ('recorded_by', 'created_at')

    def validate_visitor_count(self, value):
        """
        Validate visitor count is reasonable
        """
        if value < 0:
            raise serializers.ValidationError("Visitor count cannot be negative")
        if value > 1000:  # Reasonable maximum for a trampoline park
            raise serializers.ValidationError("Visitor count seems unusually high")
        return value

    def validate_cafe_sales(self, value):
        """
        Validate cafe sales amount
        """
        if value < 0:
            raise serializers.ValidationError("Sales amount cannot be negative")
        return value

class StaffAppraisalSerializer(serializers.ModelSerializer):
    employee_info = UserSerializer(source="employee", read_only=True)
    appraiser_info = UserSerializer(source="appraiser", read_only=True)

    class Meta:
        model = StaffAppraisal
        fields = "__all__"
        read_only_fields = ("id", "created_at")

class CafeChecklistSerializer(serializers.ModelSerializer):
    class Meta:
        model = CafeChecklist
        fields = "__all__"