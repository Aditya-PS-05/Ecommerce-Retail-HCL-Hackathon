from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from bson import ObjectId
from bson.errors import InvalidId
from app.models import CategoryCreate, CategoryUpdate, CategoryResponse, CategoryListResponse
from common.database import get_collection
from common.auth_middleware import require_admin

router = APIRouter(tags=["Categories"])


def category_to_response(category: dict) -> CategoryResponse:
    return CategoryResponse(
        id=str(category["_id"]),
        name=category["name"],
        logo=category.get("logo"),
        description=category.get("description"),
        created_at=category["created_at"]
    )


@router.get("", response_model=CategoryListResponse)
async def get_categories():
    categories_collection = get_collection("categories")
    
    categories_cursor = categories_collection.find().sort("name", 1)
    categories = [category_to_response(cat) for cat in categories_cursor]
    
    return CategoryListResponse(
        categories=categories,
        total=len(categories)
    )


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: str):
    try:
        object_id = ObjectId(category_id)
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid category ID format"
        )
    
    categories_collection = get_collection("categories")
    category = categories_collection.find_one({"_id": object_id})
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    return category_to_response(category)


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    current_user: dict = Depends(require_admin)
):
    categories_collection = get_collection("categories")
    
    existing = categories_collection.find_one({"name": category_data.name})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name already exists"
        )
    
    category_dict = category_data.model_dump()
    category_dict["created_at"] = datetime.utcnow()
    
    result = categories_collection.insert_one(category_dict)
    
    created_category = categories_collection.find_one({"_id": result.inserted_id})
    return category_to_response(created_category)


@router.patch("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: str,
    category_data: CategoryUpdate,
    current_user: dict = Depends(require_admin)
):
    try:
        object_id = ObjectId(category_id)
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid category ID format"
        )
    
    categories_collection = get_collection("categories")
    
    existing_category = categories_collection.find_one({"_id": object_id})
    if not existing_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    update_data = category_data.model_dump(exclude_unset=True)
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    if "name" in update_data:
        duplicate = categories_collection.find_one({
            "name": update_data["name"],
            "_id": {"$ne": object_id}
        })
        if duplicate:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category with this name already exists"
            )
    
    categories_collection.update_one(
        {"_id": object_id},
        {"$set": update_data}
    )
    
    updated_category = categories_collection.find_one({"_id": object_id})
    return category_to_response(updated_category)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: str,
    current_user: dict = Depends(require_admin)
):
    try:
        object_id = ObjectId(category_id)
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid category ID format"
        )
    
    categories_collection = get_collection("categories")
    
    result = categories_collection.delete_one({"_id": object_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    return None
