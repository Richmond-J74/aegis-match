import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from deps import db
from seed_data import seed_if_empty
import routes_auth
import routes_ai
import routes_marketplace
import routes_payments
import routes_messaging

app = FastAPI(title="AEGIS Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/")
async def root():
    return {"message": "AEGIS Platform API", "status": "online"}


@app.get("/api/health")
async def health():
    return {"status": "ok"}


app.include_router(routes_auth.router)
app.include_router(routes_ai.router)
app.include_router(routes_marketplace.router)
app.include_router(routes_payments.router)
app.include_router(routes_messaging.router)


@app.on_event("startup")
async def on_startup():
    try:
        await db.services.create_index("service_id")
        await db.users.create_index("user_id")
        await db.user_sessions.create_index("session_token")
        await seed_if_empty()
    except Exception as e:
        print("Startup warning:", e)
