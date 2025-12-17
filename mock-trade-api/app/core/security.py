"""
Security and authentication utilities.

Provides common security functions for authentication, authorization,
and permission checking across all modules.
"""

from typing import Optional, List
from fastapi import HTTPException, status

class SecurityUtils:
    """Common security utility functions"""
    
    @staticmethod
    def check_permission(user_permissions: List[str], required_permission: str) -> bool:
        """
        Check if user has required permission
        
        Args:
            user_permissions: List of user's permissions
            required_permission: Required permission to check
            
        Returns:
            bool: True if user has permission, False otherwise
        """
        return required_permission in user_permissions or "ADMIN" in user_permissions
    
    @staticmethod
    def require_permission(user_permissions: List[str], required_permission: str):
        """
        Require a specific permission, raise HTTPException if not present
        
        Args:
            user_permissions: List of user's permissions
            required_permission: Required permission to check
            
        Raises:
            HTTPException: If user doesn't have required permission
        """
        if not SecurityUtils.check_permission(user_permissions, required_permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied. Required: {required_permission}"
            )

def get_current_user_permissions(user_id: Optional[str] = None) -> List[str]:
    """
    Get current user's permissions.
    This is a placeholder that should be replaced with actual auth logic.
    
    Args:
        user_id: User identifier
        
    Returns:
        List of permission strings
    """
    # TODO: Implement actual permission fetching from database
    # For now, return admin permissions
    return ["ADMIN"]
