import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from deps import db, get_current_user, serialize_doc

router = APIRouter(prefix="/api", tags=["messaging"])


def convo_id_for(a: str, b: str, service_id: Optional[str] = None):
    parts = sorted([a, b])
    base = f"{parts[0]}__{parts[1]}"
    if service_id:
        base += f"__{service_id}"
    return "cnv_" + base


class StartConvoReq(BaseModel):
    participant_id: str
    service_id: Optional[str] = None
    service_title: Optional[str] = None


@router.post("/conversations")
async def start_conversation(body: StartConvoReq, user: dict = Depends(get_current_user)):
    other = await db.users.find_one({"user_id": body.participant_id}, {"_id": 0})
    other_name = other.get("name") if other else "Provider"
    other_avatar = other.get("avatar_url") if other else None
    cid = convo_id_for(user["user_id"], body.participant_id, body.service_id)
    existing = await db.conversations.find_one({"conversation_id": cid})
    if not existing:
        now = datetime.now(timezone.utc)
        doc = {
            "conversation_id": cid,
            "participants": [user["user_id"], body.participant_id],
            "participant_info": {
                user["user_id"]: {"name": user.get("name"), "avatar": user.get("avatar_url")},
                body.participant_id: {"name": other_name, "avatar": other_avatar},
            },
            "service_id": body.service_id,
            "service_title": body.service_title,
            "last_message": None,
            "created_at": now,
            "updated_at": now,
        }
        await db.conversations.insert_one(doc)
        existing = doc
    return serialize_doc(existing)


@router.get("/conversations")
async def list_conversations(user: dict = Depends(get_current_user)):
    convos = await db.conversations.find(
        {"participants": user["user_id"]}, {"_id": 0}
    ).sort("updated_at", -1).to_list(100)
    # attach unread counts
    for c in convos:
        c["unread"] = await db.messages.count_documents({
            "conversation_id": c["conversation_id"],
            "receiver_id": user["user_id"],
            "read": False,
        })
        pi = c.get("participant_info", {})
        other_id = next((p for p in c.get("participants", []) if p != user["user_id"]), None)
        c["other"] = pi.get(other_id, {"name": "User"}) if other_id else {"name": "User"}
    return serialize_doc(convos)


@router.get("/conversations/{conversation_id}/messages")
async def get_messages(conversation_id: str, user: dict = Depends(get_current_user)):
    convo = await db.conversations.find_one({"conversation_id": conversation_id})
    if not convo or user["user_id"] not in convo.get("participants", []):
        raise HTTPException(status_code=404, detail="Conversation not found")
    await db.messages.update_many(
        {"conversation_id": conversation_id, "receiver_id": user["user_id"], "read": False},
        {"$set": {"read": True}},
    )
    msgs = await db.messages.find({"conversation_id": conversation_id}, {"_id": 0}).sort("timestamp", 1).to_list(500)
    return serialize_doc(msgs)


class SendMessageReq(BaseModel):
    content: str


@router.post("/conversations/{conversation_id}/messages")
async def send_message(conversation_id: str, body: SendMessageReq, user: dict = Depends(get_current_user)):
    convo = await db.conversations.find_one({"conversation_id": conversation_id})
    if not convo or user["user_id"] not in convo.get("participants", []):
        raise HTTPException(status_code=404, detail="Conversation not found")
    receiver = next((p for p in convo["participants"] if p != user["user_id"]), user["user_id"])
    now = datetime.now(timezone.utc)
    msg = {
        "message_id": f"msg_{uuid.uuid4().hex[:12]}",
        "conversation_id": conversation_id,
        "sender_id": user["user_id"],
        "receiver_id": receiver,
        "content": body.content,
        "read": False,
        "timestamp": now,
    }
    await db.messages.insert_one(dict(msg))
    await db.conversations.update_one(
        {"conversation_id": conversation_id},
        {"$set": {"last_message": body.content[:120], "updated_at": now}},
    )
    return serialize_doc(msg)
