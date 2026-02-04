from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from bson import ObjectId
from app.models import (
    UserCreate, UserResponse, UserLogin, UserRole, Token, TokenRefresh, AccessToken, TokenUser,
    CartItem, CartItemAdd, CartItemUpdate, CartResponse
)
from common.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from common.database import get_collection
from common.auth_middleware import get_current_user

router = APIRouter(tags=["Authentication"])


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


@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    users_collection = get_collection("users")
    
    user = users_collection.find_one({"email": user_data.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    token_data = {
        "sub": str(user["_id"]),
        "email": user["email"],
        "role": user["role"]
    }
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        user=TokenUser(
            id=str(user["_id"]),
            email=user["email"],
            name=user.get("name", ""),
            role=UserRole(user["role"])
        )
    )


@router.post("/refresh", response_model=AccessToken)
async def refresh_token(token_data: TokenRefresh):
    payload = decode_token(token_data.refresh_token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type"
        )
    
    new_token_data = {
        "sub": payload.get("sub"),
        "email": payload.get("email"),
        "role": payload.get("role")
    }
    
    new_access_token = create_access_token(new_token_data)
    
    return AccessToken(access_token=new_access_token)


@router.post("/logout")
async def logout():
    return {"message": "Successfully logged out"}


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
    try:
        product = products_collection.find_one({"_id": ObjectId(item.product_id)})
    except Exception:
        product = None
        
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
            "name": product.get("title") or product.get("name", ""),
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
    try:
        product = products_collection.find_one({"_id": ObjectId(product_id)})
    except Exception:
        product = None
        
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
