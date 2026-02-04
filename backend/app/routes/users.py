from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from app.models.user import UserResponse, UserUpdate, UserRole, CartItem, CartItemAdd, CartItemUpdate, CartResponse
from app.middleware.auth import get_current_user
from app.database import get_collection

router = APIRouter(prefix="/users", tags=["Users"])


def calculate_cart_totals(cart_items: list) -> dict:
    """Calculate cart totals from cart items."""
    subtotal = sum(item.get("price", 0) * item.get("quantity", 1) for item in cart_items)
    tax = sum(item.get("price", 0) * item.get("quantity", 1) * item.get("tax_percent", 0) / 100 for item in cart_items)
    total_items = sum(item.get("quantity", 1) for item in cart_items)
    return {
        "items": cart_items,
        "total_items": total_items,
        "subtotal": round(subtotal, 2),
        "tax": round(tax, 2),
        "total": round(subtotal + tax, 2)
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    users_collection = get_collection("users")
    
    user = users_collection.find_one({"_id": ObjectId(current_user["user_id"])})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        name=user["name"],
        role=UserRole(user["role"]),
        created_at=user["created_at"]
    )


@router.patch("/me", response_model=UserResponse)
async def update_current_user_profile(
    user_data: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    users_collection = get_collection("users")
    
    update_data = {k: v for k, v in user_data.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    if "email" in update_data:
        existing_user = users_collection.find_one({
            "email": update_data["email"],
            "_id": {"$ne": ObjectId(current_user["user_id"])}
        })
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )
    
    users_collection.update_one(
        {"_id": ObjectId(current_user["user_id"])},
        {"$set": update_data}
    )
    
    updated_user = users_collection.find_one({"_id": ObjectId(current_user["user_id"])})
    
    return UserResponse(
        id=str(updated_user["_id"]),
        email=updated_user["email"],
        name=updated_user["name"],
        role=UserRole(updated_user["role"]),
        created_at=updated_user["created_at"]
    )


# ============== Cart Endpoints ==============

@router.get("/me/cart", response_model=CartResponse)
async def get_cart(current_user: dict = Depends(get_current_user)):
    """Get the current user's cart."""
    users_collection = get_collection("users")
    
    user = users_collection.find_one({"_id": ObjectId(current_user["user_id"])})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    cart_items = user.get("cart", [])
    return calculate_cart_totals(cart_items)


@router.post("/me/cart", response_model=CartResponse)
async def add_to_cart(
    item: CartItemAdd,
    current_user: dict = Depends(get_current_user)
):
    """Add a product to the cart."""
    users_collection = get_collection("users")
    products_collection = get_collection("products")
    
    # Get the product details
    product = products_collection.find_one({"_id": ObjectId(item.product_id)})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check stock
    if product.get("stock", 0) < item.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient stock"
        )
    
    # Get user's current cart
    user = users_collection.find_one({"_id": ObjectId(current_user["user_id"])})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    cart_items = user.get("cart", [])
    
    # Check if product already in cart
    existing_item_index = None
    for i, cart_item in enumerate(cart_items):
        if cart_item.get("product_id") == item.product_id:
            existing_item_index = i
            break
    
    if existing_item_index is not None:
        # Update quantity
        new_quantity = cart_items[existing_item_index]["quantity"] + item.quantity
        if new_quantity > product.get("stock", 0):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient stock"
            )
        cart_items[existing_item_index]["quantity"] = new_quantity
    else:
        # Add new item
        cart_items.append({
            "product_id": item.product_id,
            "name": product.get("name", ""),
            "price": product.get("price", 0),
            "tax_percent": product.get("tax_percent", 0),
            "quantity": item.quantity,
            "image_url": product.get("image_url")
        })
    
    # Update user's cart
    users_collection.update_one(
        {"_id": ObjectId(current_user["user_id"])},
        {"$set": {"cart": cart_items}}
    )
    
    return calculate_cart_totals(cart_items)


@router.patch("/me/cart/{product_id}", response_model=CartResponse)
async def update_cart_item(
    product_id: str,
    item: CartItemUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update quantity of a cart item."""
    users_collection = get_collection("users")
    products_collection = get_collection("products")
    
    # Check stock
    product = products_collection.find_one({"_id": ObjectId(product_id)})
    if product and item.quantity > product.get("stock", 0):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient stock"
        )
    
    user = users_collection.find_one({"_id": ObjectId(current_user["user_id"])})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    cart_items = user.get("cart", [])
    item_found = False
    
    for cart_item in cart_items:
        if cart_item.get("product_id") == product_id:
            cart_item["quantity"] = item.quantity
            item_found = True
            break
    
    if not item_found:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found in cart"
        )
    
    users_collection.update_one(
        {"_id": ObjectId(current_user["user_id"])},
        {"$set": {"cart": cart_items}}
    )
    
    return calculate_cart_totals(cart_items)


@router.delete("/me/cart/{product_id}", response_model=CartResponse)
async def remove_from_cart(
    product_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Remove a product from the cart."""
    users_collection = get_collection("users")
    
    user = users_collection.find_one({"_id": ObjectId(current_user["user_id"])})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    cart_items = user.get("cart", [])
    original_length = len(cart_items)
    cart_items = [item for item in cart_items if item.get("product_id") != product_id]
    
    if len(cart_items) == original_length:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found in cart"
        )
    
    users_collection.update_one(
        {"_id": ObjectId(current_user["user_id"])},
        {"$set": {"cart": cart_items}}
    )
    
    return calculate_cart_totals(cart_items)


@router.delete("/me/cart", response_model=CartResponse)
async def clear_cart(current_user: dict = Depends(get_current_user)):
    """Clear all items from the cart."""
    users_collection = get_collection("users")
    
    users_collection.update_one(
        {"_id": ObjectId(current_user["user_id"])},
        {"$set": {"cart": []}}
    )
    
    return calculate_cart_totals([])
