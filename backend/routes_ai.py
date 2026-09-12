import os
import io
import uuid
import json
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Request
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from deps import db, get_current_user, serialize_doc
from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

load_dotenv()
router = APIRouter(prefix="/api/ai", tags=["ai"])

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")

PROVIDER_MAP = {
    "openai": ("openai", "gpt-5.4"),
    "claude": ("anthropic", "claude-sonnet-4-6"),
}

SYSTEM_PROMPT = (
    "You are AEGIS Core AI, the intelligent matching assistant for the AEGIS service marketplace. "
    "You help clients turn their needs into clear, structured service briefs, recommend the right service "
    "categories, and answer platform FAQs. When a user describes a need, respond concisely and, when useful, "
    "produce a structured brief with: Title, Category, Scope/Deliverables, Suggested Budget, and Timeline. "
    "Available categories: Web Development, Mobile Apps, Design & Branding, Marketing & SEO, Writing & Content, "
    "Video & Animation, Data & AI, Business Consulting. Be friendly, sharp, and helpful."
)


def extract_text(filename: str, data: bytes) -> str:
    name = (filename or "").lower()
    try:
        if name.endswith(".pdf"):
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(data))
            return "\n".join((p.extract_text() or "") for p in reader.pages)[:8000]
        if name.endswith(".docx"):
            import docx
            d = docx.Document(io.BytesIO(data))
            return "\n".join(p.text for p in d.paragraphs)[:8000]
        # text-like files
        return data.decode("utf-8", errors="ignore")[:8000]
    except Exception as e:
        return f"[Could not extract file '{filename}': {e}]"


@router.get("/conversations")
async def list_conversations(user: dict = Depends(get_current_user)):
    convos = await db.ai_conversations.find(
        {"user_id": user["user_id"]}, {"_id": 0, "messages": 0}
    ).sort("updated_at", -1).to_list(100)
    return serialize_doc(convos)


@router.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str, user: dict = Depends(get_current_user)):
    convo = await db.ai_conversations.find_one(
        {"conversation_id": conversation_id, "user_id": user["user_id"]}, {"_id": 0}
    )
    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return serialize_doc(convo)


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str, user: dict = Depends(get_current_user)):
    await db.ai_conversations.delete_one({"conversation_id": conversation_id, "user_id": user["user_id"]})
    return {"ok": True}


@router.post("/chat")
async def chat(
    request: Request,
    message: str = Form(...),
    provider: str = Form("openai"),
    conversation_id: Optional[str] = Form(None),
    files: List[UploadFile] = File(default=[]),
    user: dict = Depends(get_current_user),
):
    if provider not in PROVIDER_MAP:
        provider = "openai"
    prov, model = PROVIDER_MAP[provider]

    # Build attachment context
    attach_context = ""
    attach_names = []
    for f in files or []:
        raw = await f.read()
        if not raw:
            continue
        text = extract_text(f.filename, raw)
        attach_names.append(f.filename)
        attach_context += f"\n\n--- ATTACHED FILE: {f.filename} ---\n{text}\n--- END FILE ---"

    # Load or create conversation
    convo = None
    if conversation_id:
        convo = await db.ai_conversations.find_one({"conversation_id": conversation_id, "user_id": user["user_id"]})
    if not convo:
        conversation_id = f"conv_{uuid.uuid4().hex[:12]}"
        title = message.strip()[:48] or "New chat"
        convo = {
            "conversation_id": conversation_id,
            "user_id": user["user_id"],
            "title": title,
            "provider": provider,
            "messages": [],
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        await db.ai_conversations.insert_one(dict(convo))

    # Build session message with short history context
    history = convo.get("messages", [])
    history_text = ""
    for m in history[-8:]:
        role = "User" if m["role"] == "user" else "Assistant"
        history_text += f"{role}: {m['content']}\n"

    prompt = message
    if attach_context:
        prompt = f"{message}\n{attach_context}"
    if history_text:
        prompt = f"[Conversation so far]\n{history_text}\n[New message]\n{prompt}"

    user_display = message + (f"\n\n\U0001F4CE {', '.join(attach_names)}" if attach_names else "")

    chat_client = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=conversation_id,
        system_message=SYSTEM_PROMPT,
    ).with_model(prov, model)

    async def event_gen():
        full = ""
        # send conversation id first
        yield f"event: meta\ndata: {json.dumps({'conversation_id': conversation_id})}\n\n"
        try:
            async for ev in chat_client.stream_message(UserMessage(text=prompt)):
                if isinstance(ev, TextDelta):
                    full += ev.content
                    yield f"data: {json.dumps({'delta': ev.content})}\n\n"
                elif isinstance(ev, StreamDone):
                    break
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        # persist
        await db.ai_conversations.update_one(
            {"conversation_id": conversation_id},
            {"$push": {"messages": {"$each": [
                {"role": "user", "content": user_display, "ts": datetime.now(timezone.utc).isoformat()},
                {"role": "assistant", "content": full, "ts": datetime.now(timezone.utc).isoformat()},
            ]}}, "$set": {"updated_at": datetime.now(timezone.utc), "provider": provider}},
        )
        yield f"event: done\ndata: {json.dumps({'conversation_id': conversation_id})}\n\n"

    return StreamingResponse(
        event_gen(), media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no", "Connection": "keep-alive"},
    )
