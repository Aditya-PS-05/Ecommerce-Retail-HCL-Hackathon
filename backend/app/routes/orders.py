from fastapi import APIRouter, HTTPException, status, Depends, Query
from datetime import datetime
from math import ceil
from bson import ObjectId
from bson.errors import InvalidId
from app.models.order import OrderCreate, OrderResponse, OrderListResponse, OrderItem, OrderStatus
from app.models.user import UserRole
from app.database import get_collection
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/orders", tags=["Orders"])


def order_to_response(order: dict) -> OrderResponse:
    return OrderResponse(
        id=str(order["_id"]),
        user_id=order["user_id"],
        items=[OrderItem(**item) for item in order["items"]],
        subtotal=order["subtotal"],
        tax_total=order["tax_total"],
        total=order["total"],
        status=OrderStatus(order["status"]),
        shipping_address=order.get("shipping_address"),
        created_at=order["created_at"]
    )


@router.get("", response_model=OrderListResponse)
async def get_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    orders_collection = get_collection("orders")
    
    if current_user["role"] == UserRole.ADMIN.value:
        query = {}
    else:
        query = {"user_id": current_user["user_id"]}
    
    total = orders_collection.count_documents(query)
    total_pages = ceil(total / limit) if total > 0 else 1
    
    skip = (page - 1) * limit
    orders_cursor = orders_collection.find(query).skip(skip).limit(limit).sort("created_at", -1)
    
    orders = [order_to_response(order) for order in orders_cursor]
    
    return OrderListResponse(
        orders=orders,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        object_id = ObjectId(order_id)
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order ID format"
        )
    
    orders_collection = get_collection("orders")
    order = orders_collection.find_one({"_id": object_id})
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if current_user["role"] != UserRole.ADMIN.value and order["user_id"] != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this order"
        )
    
    return order_to_response(order)


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    current_user: dict = Depends(get_current_user)
):
    products_collection = get_collection("products")
    orders_collection = get_collection("orders")
    
    order_items = []
    subtotal = 0.0
    tax_total = 0.0
    
    for item in order_data.items:
        try:
            product_id = ObjectId(item.product_id)
        except InvalidId:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid product ID: {item.product_id}"
            )
        
        product = products_collection.find_one({"_id": product_id})
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product not found: {item.product_id}"
            )
        
        if product.get("stock", 0) < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for product: {product['title']}"
            )
        
        item_subtotal = product["price"] * item.quantity
        item_tax = item_subtotal * (product.get("tax_percent", 0) / 100)
        
        order_items.append({
            "product_id": item.product_id,
            "title": product["title"],
            "price": product["price"],
            "quantity": item.quantity,
            "tax_percent": product.get("tax_percent", 0)
        })
        
        subtotal += item_subtotal
        tax_total += item_tax
        
        products_collection.update_one(
            {"_id": product_id},
            {"$inc": {"stock": -item.quantity}}
        )
    
    order_dict = {
        "user_id": current_user["user_id"],
        "items": order_items,
        "subtotal": round(subtotal, 2),
        "tax_total": round(tax_total, 2),
        "total": round(subtotal + tax_total, 2),
        "status": OrderStatus.PENDING.value,
        "shipping_address": order_data.shipping_address,
        "created_at": datetime.utcnow()
    }
    
    result = orders_collection.insert_one(order_dict)
    created_order = orders_collection.find_one({"_id": result.inserted_id})
    
    return order_to_response(created_order)


@router.post("/{order_id}/reorder", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def reorder(
    order_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        object_id = ObjectId(order_id)
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order ID format"
        )
    
    orders_collection = get_collection("orders")
    original_order = orders_collection.find_one({"_id": object_id})
    
    if not original_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if original_order["user_id"] != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only reorder your own orders"
        )
    
    from app.models.order import OrderItemCreate
    reorder_items = [
        OrderItemCreate(product_id=item["product_id"], quantity=item["quantity"])
        for item in original_order["items"]
    ]
    
    new_order_data = OrderCreate(
        items=reorder_items,
        shipping_address=original_order.get("shipping_address")
    )
    
    return await create_order(new_order_data, current_user)
