from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ProductBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    tax_percent: float = Field(default=0, ge=0, le=100)
    image_url: Optional[str] = None
    category_id: Optional[str] = None
    stock: int = Field(default=0, ge=0)
    add_ons: List[str] = []
    combos: List[str] = []


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    tax_percent: Optional[float] = Field(None, ge=0, le=100)
    image_url: Optional[str] = None
    category_id: Optional[str] = None
    stock: Optional[int] = Field(None, ge=0)
    add_ons: Optional[List[str]] = None
    combos: Optional[List[str]] = None


class ProductResponse(ProductBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    products: List[ProductResponse]
    total: int
    page: int
    limit: int
    total_pages: int
