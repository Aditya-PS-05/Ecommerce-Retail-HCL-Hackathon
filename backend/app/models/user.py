from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    CUSTOMER = "customer"


class CartItem(BaseModel):
    product_id: str
    name: str
    price: float
    tax_percent: float = 0
    quantity: int = 1
    image_url: Optional[str] = None


class CartItemAdd(BaseModel):
    product_id: str
    quantity: int = 1


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1)


class CartResponse(BaseModel):
    items: List[CartItem] = []
    total_items: int = 0
    subtotal: float = 0
    tax: float = 0
    total: float = 0


class UserBase(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=100)


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: str
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None


class UserInDB(UserBase):
    id: str
    password_hash: str
    role: UserRole
    created_at: datetime
