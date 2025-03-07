from rest_framework import permissions


class IsOwnerOrTeamMember(permissions.BasePermission):
    """
    Custom permission to only allow owners or team members of a protocol to access it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Allow all for users with admin permission
        if request.user.is_staff:
            return True
        
        # Check if the user is the owner (creator)
        if obj.created_by == request.user:
            return True
        
        # Check if the user is a team member
        if hasattr(obj, 'team_members'):
            # For read operations, allow team members with any permission
            if request.method in permissions.SAFE_METHODS:
                return obj.team_members.filter(user=request.user).exists()
            
            # For write operations, check for edit or admin permission
            return obj.team_members.filter(
                user=request.user, 
                permissions__in=['edit', 'admin']
            ).exists()
        
        return False 