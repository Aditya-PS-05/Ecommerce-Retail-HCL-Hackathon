from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ProductResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    price: float
    tax_percent: float = 0
    image_url: Optional[str] = None
    category_id: Optional[str] = None
    stock: int = 0
    add_ons: List[str] = []
    combos: List[str] = []
    created_at: datetime

    class Config:
        from_attributes = True
