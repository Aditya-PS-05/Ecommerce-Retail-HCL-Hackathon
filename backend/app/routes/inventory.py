from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from bson import ObjectId
from bson.errors import InvalidId
from app.models.inventory import StockUpdate, InventoryItem, InventoryListResponse
from app.database import get_collection
from app.middleware.rbac import require_admin

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.get("", response_model=InventoryListResponse)
async def get_inventory(current_user: dict = Depends(require_admin)):
    products_collection = get_collection("products")
    
    products_cursor = products_collection.find(
        {},
        {"_id": 1, "title": 1, "stock": 1, "category_id": 1}
    ).sort("title", 1)
    
    items = []
    for product in products_cursor:
        items.append(InventoryItem(
            product_id=str(product["_id"]),
            title=product["title"],
            stock=product.get("stock", 0),
            category_id=product.get("category_id")
        ))
    
    return InventoryListResponse(
        items=items,
        total=len(items)
    )


@router.patch("/{product_id}", response_model=InventoryItem)
async def update_stock(
    product_id: str,
    stock_data: StockUpdate,
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
    stock_history_collection = get_collection("stock_history")
    
    product = products_collection.find_one({"_id": object_id})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    previous_stock = product.get("stock", 0)
    new_stock = stock_data.stock
    
    stock_history_collection.insert_one({
        "product_id": product_id,
        "previous_stock": previous_stock,
        "new_stock": new_stock,
        "change": new_stock - previous_stock,
        "reason": stock_data.reason,
        "updated_by": current_user["user_id"],
        "created_at": datetime.utcnow()
    })
    
    products_collection.update_one(
        {"_id": object_id},
        {"$set": {"stock": new_stock}}
    )
    
    return InventoryItem(
        product_id=product_id,
        title=product["title"],
        stock=new_stock,
        category_id=product.get("category_id")
    )
