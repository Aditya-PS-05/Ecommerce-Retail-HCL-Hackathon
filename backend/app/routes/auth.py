from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from app.models.user import UserCreate, UserResponse, UserRole
from app.utils.security import hash_password
from app.database import get_collection

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    users_collection = get_collection("users")
    
    existing_user = users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user_dict = {
        "email": user_data.email,
        "name": user_data.name,
        "password_hash": hash_password(user_data.password),
        "role": UserRole.CUSTOMER.value,
        "created_at": datetime.utcnow()
    }
    
    result = users_collection.insert_one(user_dict)
    
    return UserResponse(
        id=str(result.inserted_id),
        email=user_dict["email"],
        name=user_dict["name"],
        role=UserRole.CUSTOMER,
        created_at=user_dict["created_at"]
    )
