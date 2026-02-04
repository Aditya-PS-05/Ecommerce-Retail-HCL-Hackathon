from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class OrderItem(BaseModel):
    product_id: str
    title: str
    price: float
    quantity: int = Field(..., ge=1)
    tax_percent: float = Field(default=0, ge=0, le=100)


class OrderItemCreate(BaseModel):
    product_id: str
    quantity: int = Field(..., ge=1)


class OrderCreate(BaseModel):
    items: List[OrderItemCreate] = Field(..., min_length=1)
    shipping_address: Optional[str] = None


class OrderResponse(BaseModel):
    id: str
    user_id: str
    items: List[OrderItem]
    subtotal: float
    tax_total: float
    total: float
    status: OrderStatus
    shipping_address: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class OrderListResponse(BaseModel):
    orders: List[OrderResponse]
    total: int
    page: int
    limit: int
    total_pages: int
