import os
import uuid
import bcrypt
import httpx
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Request, Response, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from deps import db, get_current_user, serialize_doc

router = APIRouter(prefix="/api/auth", tags=["auth"])

SESSION_DAYS = 7
EMERGENT_SESSION_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"


def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()


def verify_password(p: str, h: str) -> bool:
    try:
        return bcrypt.checkpw(p.encode(), h.encode())
    except Exception:
        return False


def new_user_id():
    return f"user_{uuid.uuid4().hex[:12]}"


def new_token():
    return f"st_{uuid.uuid4().hex}{uuid.uuid4().hex}"


async def create_session(user_id: str) -> str:
    token = new_token()
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=SESSION_DAYS),
        "created_at": datetime.now(timezone.utc),
    })
    return token


def set_session_cookie(response: Response, token: str):
    response.set_cookie(
        key="session_token", value=token, max_age=SESSION_DAYS * 24 * 3600,
        httponly=True, secure=True, samesite="none", path="/",
    )


class RegisterReq(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginReq(BaseModel):
    email: EmailStr
    password: str


class OnboardingReq(BaseModel):
    role: str
    interests: list[str] = []
    notifications: dict = {}


def public_user(u: dict) -> dict:
    u = serialize_doc(u)
    u.pop("password_hash", None)
    return u


@router.post("/register")
async def register(req: RegisterReq, response: Response):
    existing = await db.users.find_one({"email": req.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = new_user_id()
    doc = {
        "user_id": user_id,
        "name": req.name,
        "email": req.email.lower(),
        "password_hash": hash_password(req.password),
        "role": None,
        "avatar_url": None,
        "picture": None,
        "interests": [],
        "notifications": {"email": True, "push": True, "sms": False},
        "onboarding_complete": False,
        "created_at": datetime.now(timezone.utc),
    }
    await db.users.insert_one(doc)
    token = await create_session(user_id)
    set_session_cookie(response, token)
    return {"user": public_user(doc), "session_token": token}


@router.post("/login")
async def login(req: LoginReq, response: Response):
    user = await db.users.find_one({"email": req.email.lower()})
    if not user or not user.get("password_hash") or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = await create_session(user["user_id"])
    set_session_cookie(response, token)
    return {"user": public_user(user), "session_token": token}


class SessionReq(BaseModel):
    session_id: str


@router.post("/google/session")
async def google_session(req: SessionReq, response: Response):
    async with httpx.AsyncClient(timeout=20) as hc:
        r = await hc.get(EMERGENT_SESSION_URL, headers={"X-Session-ID": req.session_id})
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Failed to validate Google session")
    data = r.json()
    email = (data.get("email") or "").lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one({"user_id": user_id}, {"$set": {
            "name": data.get("name") or existing.get("name"),
            "picture": data.get("picture"),
            "avatar_url": data.get("picture"),
        }})
        user = await db.users.find_one({"user_id": user_id})
    else:
        user_id = new_user_id()
        user = {
            "user_id": user_id,
            "name": data.get("name") or email.split("@")[0],
            "email": email,
            "password_hash": None,
            "role": None,
            "avatar_url": data.get("picture"),
            "picture": data.get("picture"),
            "interests": [],
            "notifications": {"email": True, "push": True, "sms": False},
            "onboarding_complete": False,
            "created_at": datetime.now(timezone.utc),
        }
        await db.users.insert_one(user)
    # Use the emergent-provided session_token for durability, fallback to our own
    token = data.get("session_token") or new_token()
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=SESSION_DAYS),
        "created_at": datetime.now(timezone.utc),
    })
    set_session_cookie(response, token)
    return {"user": public_user(user), "session_token": token}


@router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    return public_user(user)


@router.post("/onboarding")
async def onboarding(req: OnboardingReq, user: dict = Depends(get_current_user)):
    if req.role not in ("client", "provider"):
        raise HTTPException(status_code=400, detail="Invalid role")
    await db.users.update_one({"user_id": user["user_id"]}, {"$set": {
        "role": req.role,
        "interests": req.interests,
        "notifications": req.notifications or user.get("notifications"),
        "onboarding_complete": True,
    }})
    updated = await db.users.find_one({"user_id": user["user_id"]})
    return public_user(updated)


@router.post("/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie("session_token", path="/")
    return {"ok": True}
