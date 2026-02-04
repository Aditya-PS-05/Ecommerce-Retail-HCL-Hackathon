from fastapi import Depends, HTTPException, status
from app.middleware.auth import get_current_user
from app.models.user import UserRole
from typing import List


class RoleChecker:
    def __init__(self, allowed_roles: List[UserRole]):
        self.allowed_roles = allowed_roles
    
    async def __call__(self, current_user: dict = Depends(get_current_user)) -> dict:
        if current_user["role"] not in [role.value for role in self.allowed_roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to perform this action"
            )
        return current_user


require_admin = RoleChecker([UserRole.ADMIN])

require_customer = RoleChecker([UserRole.CUSTOMER])

require_any_role = RoleChecker([UserRole.ADMIN, UserRole.CUSTOMER])
