from rest_framework.permissions import BasePermission, SAFE_METHODS

class AppraisalAccessPermission(BasePermission):
    """
    - Superusers/staff (is_staff) see everything.
    - If user has custom role == 'staff' -> can view/create, see those they appraised or for their team.
    - Regular users -> can view only appraisals where they are the employee.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser or request.user.is_staff:
            return True
        role = getattr(request.user, "role", None)
        if role == "staff":
            # staff can view what they appraised or for employees they manage (customize if needed)
            return obj.appraiser_id == request.user.id or obj.employee_id == request.user.id
        # default: employee can only see their own
        return obj.employee_id == request.user.id