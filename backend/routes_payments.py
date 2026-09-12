import os
import uuid
import stripe
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from dotenv import load_dotenv
from deps import db, get_current_user, get_optional_user, serialize_doc

load_dotenv()
router = APIRouter(prefix="/api", tags=["payments"])

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY") or "sk_test_emergent"
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")


class CheckoutReq(BaseModel):
    service_id: str
    tier_index: int = 0
    origin_url: str


@router.post("/payments/checkout")
async def create_checkout(req: CheckoutReq, user: dict = Depends(get_current_user)):
    service = await db.services.find_one({"service_id": req.service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    tiers = service.get("pricing_tiers") or []
    if tiers and 0 <= req.tier_index < len(tiers):
        tier = tiers[req.tier_index]
        amount = float(tier["price"])
        tier_name = tier.get("name", "Standard")
    else:
        amount = float(service.get("price", 0))
        tier_name = "Standard"
    unit_amount = int(round(amount * 100))

    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            line_items=[{
                "price_data": {
                    "currency": "usd",
                    "product_data": {"name": f"{service['title']} - {tier_name}"},
                    "unit_amount": unit_amount,
                },
                "quantity": 1,
            }],
            success_url=f"{req.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{req.origin_url}/payment/cancel",
            metadata={
                "service_id": req.service_id,
                "user_id": user["user_id"],
                "tier_name": tier_name,
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stripe error: {e}")

    now = datetime.now(timezone.utc)
    order_id = f"ord_{uuid.uuid4().hex[:12]}"
    await db.payment_transactions.insert_one({
        "session_id": session.id,
        "order_id": order_id,
        "user_id": user["user_id"],
        "service_id": req.service_id,
        "amount": amount,
        "currency": "usd",
        "status": "initiated",
        "payment_status": "pending",
        "created_at": now,
        "updated_at": now,
    })
    await db.orders.insert_one({
        "order_id": order_id,
        "session_id": session.id,
        "user_id": user["user_id"],
        "service_id": req.service_id,
        "service_title": service["title"],
        "service_image": service.get("image"),
        "provider_name": service.get("provider_name"),
        "tier_name": tier_name,
        "amount": amount,
        "status": "pending",
        "timestamp": now,
    })
    return {"checkout_url": session.url, "session_id": session.id}


@router.get("/payments/status/{session_id}")
async def get_status(session_id: str):
    record = await db.payment_transactions.find_one({"session_id": session_id})
    if not record:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if record.get("payment_status") != "paid":
        try:
            s = stripe.checkout.Session.retrieve(session_id)
            if s.payment_status == "paid" or s.status == "complete":
                now = datetime.now(timezone.utc)
                await db.payment_transactions.update_one(
                    {"session_id": session_id, "payment_status": {"$ne": "paid"}},
                    {"$set": {"status": "completed", "payment_status": "paid", "updated_at": now}},
                )
                await db.orders.update_one(
                    {"session_id": session_id, "status": {"$ne": "active"}},
                    {"$set": {"status": "active", "updated_at": now}},
                )
                record = await db.payment_transactions.find_one({"session_id": session_id})
        except Exception:
            pass
    return {
        "session_id": record["session_id"],
        "status": record["status"],
        "payment_status": record["payment_status"],
    }


@router.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid signature")
    obj = event["data"]["object"]
    t = event["type"]
    now = datetime.now(timezone.utc)
    if t == "checkout.session.completed":
        await db.payment_transactions.update_one(
            {"session_id": obj["id"], "payment_status": {"$ne": "paid"}},
            {"$set": {"status": "completed", "payment_status": obj.get("payment_status", "paid"), "updated_at": now}},
        )
        await db.orders.update_one(
            {"session_id": obj["id"], "status": {"$ne": "active"}},
            {"$set": {"status": "active", "updated_at": now}},
        )
    return {"status": "ok"}


@router.get("/payments/config")
async def payment_config():
    return {"publishable_key": os.environ.get("STRIPE_PUBLISHABLE_KEY", ""), "mode": os.environ.get("STRIPE_MODE", "test")}
