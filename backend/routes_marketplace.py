import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from deps import db, get_current_user, get_optional_user, serialize_doc

router = APIRouter(prefix="/api", tags=["marketplace"])

CATEGORIES = [
    "Web Development", "Mobile Apps", "Design & Branding", "Marketing & SEO",
    "Writing & Content", "Video & Animation", "Data & AI", "Business Consulting",
]


@router.get("/categories")
async def get_categories():
    return CATEGORIES


@router.get("/services")
async def list_services(
    search: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_rating: Optional[float] = None,
    tags: Optional[str] = None,
    sort: str = "popular",
):
    q = {}
    if search:
        q["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"tags": {"$regex": search, "$options": "i"}},
        ]
    if category and category != "All":
        q["category"] = category
    if min_price is not None or max_price is not None:
        pq = {}
        if min_price is not None:
            pq["$gte"] = min_price
        if max_price is not None:
            pq["$lte"] = max_price
        q["price"] = pq
    if min_rating is not None:
        q["rating"] = {"$gte": min_rating}
    if tags:
        tag_list = [t.strip() for t in tags.split(",") if t.strip()]
        if tag_list:
            q["tags"] = {"$in": tag_list}

    sort_map = {
        "popular": [("reviews_count", -1)],
        "rating": [("rating", -1)],
        "price_low": [("price", 1)],
        "price_high": [("price", -1)],
        "newest": [("created_at", -1)],
    }
    cursor = db.services.find(q, {"_id": 0}).sort(sort_map.get(sort, sort_map["popular"]))
    services = await cursor.to_list(200)
    return serialize_doc(services)


@router.get("/services/{service_id}")
async def get_service(service_id: str):
    s = await db.services.find_one({"service_id": service_id}, {"_id": 0})
    if not s:
        raise HTTPException(status_code=404, detail="Service not found")
    return serialize_doc(s)


class PricingTier(BaseModel):
    name: str
    price: float
    description: str = ""
    delivery_days: int = 7
    features: List[str] = []


class ServiceCreate(BaseModel):
    title: str
    category: str
    price: float
    description: str
    tags: List[str] = []
    image: Optional[str] = None
    delivery_days: int = 7
    pricing_tiers: List[PricingTier] = []


@router.post("/services")
async def create_service(body: ServiceCreate, user: dict = Depends(get_current_user)):
    service_id = f"svc_{uuid.uuid4().hex[:12]}"
    doc = {
        "service_id": service_id,
        "title": body.title,
        "category": body.category,
        "price": body.price,
        "description": body.description,
        "rating": 0.0,
        "reviews_count": 0,
        "reviews": [],
        "tags": body.tags,
        "image": body.image,
        "delivery_days": body.delivery_days,
        "pricing_tiers": [t.dict() for t in body.pricing_tiers] or [
            {"name": "Standard", "price": body.price, "description": body.description[:80],
             "delivery_days": body.delivery_days, "features": body.tags[:4]}
        ],
        "media": [body.image] if body.image else [],
        "provider_id": user["user_id"],
        "provider_name": user.get("name"),
        "provider_avatar": user.get("avatar_url"),
        "created_at": datetime.now(timezone.utc),
    }
    await db.services.insert_one(doc)
    return serialize_doc(doc)


@router.get("/my/services")
async def my_services(user: dict = Depends(get_current_user)):
    svcs = await db.services.find({"provider_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return serialize_doc(svcs)


# ---------------- Service Requests ----------------
class ServiceRequestCreate(BaseModel):
    title: str
    category: str
    brief: str
    budget: Optional[float] = None
    timeline: Optional[str] = None


@router.post("/requests")
async def create_request(body: ServiceRequestCreate, user: dict = Depends(get_current_user)):
    request_id = f"req_{uuid.uuid4().hex[:12]}"
    doc = {
        "request_id": request_id,
        "user_id": user["user_id"],
        "title": body.title,
        "category": body.category,
        "brief": body.brief,
        "budget": body.budget,
        "timeline": body.timeline,
        "status": "open",
        "created_at": datetime.now(timezone.utc),
    }
    await db.service_requests.insert_one(doc)
    return serialize_doc(doc)


@router.get("/requests")
async def list_requests(user: dict = Depends(get_current_user)):
    reqs = await db.service_requests.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return serialize_doc(reqs)


# ---------------- Orders ----------------
@router.get("/orders")
async def list_orders(user: dict = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": user["user_id"]}, {"_id": 0}).sort("timestamp", -1).to_list(100)
    return serialize_doc(orders)


# ---------------- Dashboard ----------------
@router.get("/dashboard/summary")
async def dashboard_summary(user: dict = Depends(get_current_user)):
    uid = user["user_id"]
    orders = await db.orders.find({"user_id": uid}, {"_id": 0}).sort("timestamp", -1).to_list(200)
    reqs = await db.service_requests.find({"user_id": uid}, {"_id": 0}).sort("created_at", -1).to_list(200)
    active_orders = [o for o in orders if o.get("status") in ("pending", "active")]
    completed = [o for o in orders if o.get("status") == "completed"]
    total_spent = sum(o.get("amount", 0) for o in orders if o.get("status") in ("active", "completed"))
    open_reqs = [r for r in reqs if r.get("status") == "open"]
    return serialize_doc({
        "metrics": {
            "active_orders": len(active_orders),
            "completed_orders": len(completed),
            "open_requests": len(open_reqs),
            "total_spent": round(total_spent, 2),
        },
        "active_orders": active_orders[:6],
        "recent_requests": reqs[:6],
        "recent_orders": orders[:8],
    })
