from fastapi import APIRouter, Query
from typing import List
import re
from app.models import ProductResponse
from common.database import get_collection

router = APIRouter(tags=["Search"])


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


@router.get("", response_model=List[ProductResponse])
async def search_products(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(20, ge=1, le=100, description="Max results")
):
    products_collection = get_collection("products")
    categories_collection = get_collection("categories")
    
    escaped_query = re.escape(q)
    regex_pattern = {"$regex": escaped_query, "$options": "i"}
    
    matching_categories = categories_collection.find(
        {"name": regex_pattern},
        {"_id": 1}
    )
    category_ids = [str(cat["_id"]) for cat in matching_categories]
    
    query = {
        "$or": [
            {"title": regex_pattern},
            {"description": regex_pattern}
        ]
    }
    
    if category_ids:
        query["$or"].append({"category_id": {"$in": category_ids}})
    
    products_cursor = products_collection.find(query).limit(limit)
    
    return [product_to_response(product) for product in products_cursor]
