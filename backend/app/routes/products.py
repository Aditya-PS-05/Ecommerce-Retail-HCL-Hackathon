from fastapi import APIRouter, Query, HTTPException, status, Depends
from typing import Optional
from math import ceil
from datetime import datetime
from bson import ObjectId
from bson.errors import InvalidId
from app.models.product import ProductCreate, ProductUpdate, ProductResponse, ProductListResponse
from app.database import get_collection
from app.middleware.rbac import require_admin

router = APIRouter(prefix="/products", tags=["Products"])


def product_to_response(product: dict) -> ProductResponse:
    return ProductResponse(
        id=str(product["_id"]),
        title=product["title"],
        description=product.get("description"),
        price=product["price"],
        tax_percent=product.get("tax_percent", 0),
        image_url=product.get("image_url"),
        category_id=product.get("category_id"),
        stock=product.get("stock", 0),
        add_ons=product.get("add_ons", []),
        combos=product.get("combos", []),
        created_at=product["created_at"]
    )


@router.get("", response_model=ProductListResponse)
async def get_products(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    category_id: Optional[str] = Query(None, description="Filter by category")
):
    products_collection = get_collection("products")
    
    query = {}
    if category_id:
        query["category_id"] = category_id
    
    total = products_collection.count_documents(query)
    total_pages = ceil(total / limit) if total > 0 else 1
    
    skip = (page - 1) * limit
    
    products_cursor = products_collection.find(query).skip(skip).limit(limit).sort("created_at", -1)
    
    products = [product_to_response(product) for product in products_cursor]
    
    return ProductListResponse(
        products=products,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    try:
        object_id = ObjectId(product_id)
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID format"
        )
    
    products_collection = get_collection("products")
    product = products_collection.find_one({"_id": object_id})
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    return product_to_response(product)


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    current_user: dict = Depends(require_admin)
):
    products_collection = get_collection("products")
    
    product_dict = product_data.model_dump()
    product_dict["created_at"] = datetime.utcnow()
    
    result = products_collection.insert_one(product_dict)
    
    created_product = products_collection.find_one({"_id": result.inserted_id})
    return product_to_response(created_product)


@router.patch("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    product_data: ProductUpdate,
    current_user: dict = Depends(require_admin)
):
    try:
        object_id = ObjectId(product_id)
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID format"
        )
    
    products_collection = get_collection("products")
    
    existing_product = products_collection.find_one({"_id": object_id})
    if not existing_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    update_data = product_data.model_dump(exclude_unset=True)
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    products_collection.update_one(
        {"_id": object_id},
        {"$set": update_data}
    )
    
    updated_product = products_collection.find_one({"_id": object_id})
    return product_to_response(updated_product)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: str,
    current_user: dict = Depends(require_admin)
):
    try:
        object_id = ObjectId(product_id)
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID format"
        )
    
    products_collection = get_collection("products")
    
    result = products_collection.delete_one({"_id": object_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    return None
