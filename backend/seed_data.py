import uuid
from datetime import datetime, timezone, timedelta
from deps import db

PROVIDERS = [
    {"user_id": "prov_nova", "name": "Nova Studio", "email": "nova@aegis.dev"},
    {"user_id": "prov_apex", "name": "Apex Labs", "email": "apex@aegis.dev"},
    {"user_id": "prov_lumen", "name": "Lumen Collective", "email": "lumen@aegis.dev"},
    {"user_id": "prov_quark", "name": "Quark Digital", "email": "quark@aegis.dev"},
    {"user_id": "prov_atlas", "name": "Atlas Consulting", "email": "atlas@aegis.dev"},
]

REVIEW_AUTHORS = ["Maya R.", "Devin K.", "Priya S.", "Leo M.", "Sara T.", "Owen B."]


def _reviews(n, base):
    texts = [
        "Exceptional work, delivered ahead of schedule.",
        "Clear communication and top-tier quality.",
        "Exceeded expectations. Highly recommend.",
        "Professional, fast, and detail-oriented.",
        "Great value and stunning final result.",
        "Would absolutely hire again.",
    ]
    out = []
    for i in range(n):
        out.append({
            "author": REVIEW_AUTHORS[i % len(REVIEW_AUTHORS)],
            "rating": round(min(5.0, base + (0.1 * (i % 3))), 1),
            "text": texts[i % len(texts)],
            "date": (datetime.now(timezone.utc) - timedelta(days=i * 5)).isoformat(),
        })
    return out


def _tiers(base):
    return [
        {"name": "Basic", "price": base, "description": "Essential package to get started.",
         "delivery_days": 7, "features": ["1 concept", "2 revisions", "Source files"]},
        {"name": "Standard", "price": round(base * 2.2, 2), "description": "Most popular, balanced scope.",
         "delivery_days": 5, "features": ["3 concepts", "Unlimited revisions", "Source files", "Priority support"]},
        {"name": "Premium", "price": round(base * 4.5, 2), "description": "Full end-to-end delivery.",
         "delivery_days": 3, "features": ["5 concepts", "Unlimited revisions", "Source files", "Priority support", "30-day support"]},
    ]


SERVICES = [
    ("Modern SaaS Web App Development", "Web Development", 450, "prov_apex", 4.9, 214,
     ["react", "fastapi", "saas", "responsive"]),
    ("Landing Page That Converts", "Web Development", 180, "prov_nova", 4.8, 132,
     ["landing", "tailwind", "cro"]),
    ("iOS & Android Mobile App", "Mobile Apps", 620, "prov_quark", 4.9, 98,
     ["react-native", "ios", "android"]),
    ("Cross-Platform App MVP", "Mobile Apps", 380, "prov_apex", 4.7, 76,
     ["mvp", "flutter", "startup"]),
    ("Complete Brand Identity Kit", "Design & Branding", 320, "prov_lumen", 5.0, 187,
     ["logo", "branding", "guidelines"]),
    ("Premium Logo Design", "Design & Branding", 120, "prov_nova", 4.8, 245,
     ["logo", "vector", "identity"]),
    ("SEO Growth Strategy", "Marketing & SEO", 260, "prov_atlas", 4.7, 89,
     ["seo", "content", "analytics"]),
    ("Paid Ads Campaign Setup", "Marketing & SEO", 300, "prov_quark", 4.6, 64,
     ["ads", "google", "meta"]),
    ("Long-Form Blog & Articles", "Writing & Content", 90, "prov_lumen", 4.8, 158,
     ["blog", "copywriting", "seo"]),
    ("Sales Page Copywriting", "Writing & Content", 210, "prov_nova", 4.9, 71,
     ["copy", "conversion", "sales"]),
    ("Explainer Video Animation", "Video & Animation", 480, "prov_lumen", 4.9, 112,
     ["motion", "2d", "explainer"]),
    ("Social Media Video Pack", "Video & Animation", 150, "prov_quark", 4.7, 143,
     ["reels", "shorts", "editing"]),
    ("Custom AI Chatbot Build", "Data & AI", 540, "prov_apex", 4.9, 87,
     ["ai", "llm", "automation"]),
    ("Data Dashboard & Analytics", "Data & AI", 400, "prov_atlas", 4.8, 54,
     ["dashboard", "python", "viz"]),
    ("Startup Financial Model", "Business Consulting", 350, "prov_atlas", 4.8, 61,
     ["finance", "strategy", "pitch"]),
    ("Go-To-Market Strategy", "Business Consulting", 420, "prov_atlas", 4.7, 43,
     ["gtm", "strategy", "growth"]),
]


async def seed_if_empty():
    count = await db.services.count_documents({})
    if count > 0:
        return
    now = datetime.now(timezone.utc)
    # providers as users (so messaging works)
    for p in PROVIDERS:
        await db.users.update_one(
            {"user_id": p["user_id"]},
            {"$setOnInsert": {
                "user_id": p["user_id"], "name": p["name"], "email": p["email"],
                "role": "provider", "avatar_url": None, "picture": None,
                "password_hash": None, "interests": [], "onboarding_complete": True,
                "notifications": {"email": True, "push": True, "sms": False},
                "created_at": now,
            }},
            upsert=True,
        )
    prov_names = {p["user_id"]: p["name"] for p in PROVIDERS}
    docs = []
    for title, category, base, prov, rating, rc, tags in SERVICES:
        sid = f"svc_{uuid.uuid4().hex[:12]}"
        docs.append({
            "service_id": sid,
            "title": title,
            "category": category,
            "price": float(base),
            "description": (
                f"{title} by {prov_names[prov]}. We deliver a polished, production-ready result "
                f"tailored to your goals. Includes discovery, execution, and revisions to make sure "
                f"the outcome exceeds expectations. Perfect for teams and founders who value quality and speed."
            ),
            "rating": rating,
            "reviews_count": rc,
            "reviews": _reviews(5, rating),
            "tags": tags,
            "image": None,
            "delivery_days": 5,
            "pricing_tiers": _tiers(float(base)),
            "media": [],
            "provider_id": prov,
            "provider_name": prov_names[prov],
            "provider_avatar": None,
            "created_at": now,
        })
    if docs:
        await db.services.insert_many(docs)
