"""
AEGIS Platform — Combined Core POC Test
Validates the risky integrations in isolation BEFORE building the full app:
  1. OpenAI GPT chat (streaming)
  2. Anthropic Claude chat (streaming)
  3. File attachment handling (text extraction injected into prompt — provider-agnostic)
  4. Stripe Checkout session creation (test-mode sandbox, dynamic amount via inline price_data)
"""
import os
import asyncio
import traceback
from dotenv import load_dotenv

load_dotenv()

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")

from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

RESULTS = {}


async def stream_reply(provider, model, prompt, system="You are AEGIS Core AI, a concise assistant."):
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"poc-{provider}",
        system_message=system,
    ).with_model(provider, model)
    out = ""
    async for ev in chat.stream_message(UserMessage(text=prompt)):
        if isinstance(ev, TextDelta):
            out += ev.content
        elif isinstance(ev, StreamDone):
            break
    return out.strip()


async def test_openai():
    try:
        reply = await stream_reply("openai", "gpt-5.4", "Say 'AEGIS OpenAI OK' and nothing else.")
        print(f"[OpenAI] reply: {reply!r}")
        RESULTS["openai"] = bool(reply)
    except Exception as e:
        print("[OpenAI] FAILED:", e)
        traceback.print_exc()
        RESULTS["openai"] = False


async def test_claude():
    try:
        reply = await stream_reply("anthropic", "claude-sonnet-4-6", "Say 'AEGIS Claude OK' and nothing else.")
        print(f"[Claude] reply: {reply!r}")
        RESULTS["claude"] = bool(reply)
    except Exception as e:
        print("[Claude] FAILED:", e)
        traceback.print_exc()
        RESULTS["claude"] = False


async def test_file_attachment():
    """Simulate a user uploading a brief document; extract text and inject into prompt.
    This is provider-agnostic and works for OpenAI + Claude."""
    try:
        file_text = (
            "PROJECT BRIEF\n"
            "Client needs a mobile app for a local bakery: online ordering, "
            "loyalty points, and push notifications. Budget: $8000. Timeline: 6 weeks."
        )
        prompt = (
            "A user attached this document. Extract the service category and budget as a short line.\n\n"
            f"--- ATTACHED DOCUMENT ---\n{file_text}\n--- END ---"
        )
        reply = await stream_reply("openai", "gpt-5.4", prompt)
        print(f"[FileAttach] reply: {reply!r}")
        RESULTS["file_attachment"] = bool(reply) and ("8000" in reply or "8,000" in reply or "budget" in reply.lower())
    except Exception as e:
        print("[FileAttach] FAILED:", e)
        traceback.print_exc()
        RESULTS["file_attachment"] = False


def test_stripe():
    """Create a Stripe Checkout Session in test mode with a dynamic amount (inline price_data)."""
    try:
        import stripe
        stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")
        origin = "https://aegis-match.preview.emergentagent.com"
        session = stripe.checkout.Session.create(
            mode="payment",
            line_items=[{
                "price_data": {
                    "currency": "usd",
                    "product_data": {"name": "AEGIS Service: Logo Design Package"},
                    "unit_amount": 12000,  # $120.00 dynamic amount
                },
                "quantity": 1,
            }],
            success_url=f"{origin}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{origin}/payment/cancel",
            metadata={"service_id": "poc-service-1", "user_id": "poc-user"},
        )
        print(f"[Stripe] session id: {session.id}")
        print(f"[Stripe] checkout url: {session.url[:60]}...")
        RESULTS["stripe"] = bool(session.id and session.url)
    except Exception as e:
        print("[Stripe] FAILED:", e)
        traceback.print_exc()
        RESULTS["stripe"] = False


async def main():
    print("=" * 60)
    print("AEGIS CORE POC — running integration checks")
    print("=" * 60)
    await test_openai()
    await test_claude()
    await test_file_attachment()
    test_stripe()

    print("\n" + "=" * 60)
    print("RESULTS")
    print("=" * 60)
    for k, v in RESULTS.items():
        print(f"  {k:18s}: {'PASS' if v else 'FAIL'}")
    all_pass = all(RESULTS.values())
    print("\nOVERALL:", "ALL PASS ✅" if all_pass else "SOME FAILED ❌")
    return all_pass


if __name__ == "__main__":
    ok = asyncio.run(main())
    exit(0 if ok else 1)
