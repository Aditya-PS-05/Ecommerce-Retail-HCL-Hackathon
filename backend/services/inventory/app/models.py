from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class StockUpdate(BaseModel):
    stock: int = Field(..., ge=0)
    reason: Optional[str] = None


class InventoryItem(BaseModel):
    product_id: str
    title: str
    stock: int
    category_id: Optional[str] = None


class InventoryListResponse(BaseModel):
    items: List[InventoryItem]
    total: int


class StockHistoryEntry(BaseModel):
    id: str
    product_id: str
    previous_stock: int
    new_stock: int
    change: int
    reason: Optional[str] = None
    updated_by: str
    created_at: datetime

    class Config:
        from_attributes = True
