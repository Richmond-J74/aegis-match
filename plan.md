# AEGIS Platform (FARM: React + FastAPI + MongoDB) — Development Plan

## 1) Objectives
- Deliver a PWA-ready, dark glassmorphism AEGIS web app with: onboarding, dashboard, AI assistant (OpenAI+Claude + file upload), marketplace + request builder, messaging, and Stripe Checkout (test mode).
- De-risk the core workflow first with an isolated POC: **LLM chat (OpenAI+Claude) + file attachment + Stripe checkout session creation** validated via **one** `test_core.py`.
- Build V1 app around proven integrations, then expand to real-time-ish messaging, provider tooling, and auth (Email/Password + Google OAuth) once core UX is solid.

## 2) Implementation Steps

### Phase 1 — Core Integration POC (isolation; do not proceed until green)
**User stories**
1. As a user, I can send a prompt to OpenAI GPT and get a valid assistant reply.
2. As a user, I can switch to Anthropic Claude and get a valid assistant reply.
3. As a user, I can attach a small file to the AI request and the backend accepts/processes it.
4. As a user, I can create a Stripe Checkout Session in test mode and receive a valid session URL/id.
5. As a developer, I can run one script (`test_core.py`) that validates all critical integrations end-to-end.

**Steps**
- Websearch: confirm current best-practice patterns for Stripe Checkout Sessions + webhook basics (test mode) and multi-provider LLM routing (OpenAI/Claude) in FastAPI.
- Pull Emergent integration playbooks for:
  - Universal LLM (OpenAI + Claude) including file input expectations.
  - Stripe Checkout (test mode) session creation + success/cancel URLs.
- Implement minimal backend-only POC code (no auth):
  - `POST /api/poc/llm/chat` supports `{provider, messages, attachments[]}`.
  - `POST /api/poc/stripe/checkout-session` supports `{service_id, price, currency}`.
- Create **one** combined script `test_core.py` that:
  - Calls OpenAI chat endpoint.
  - Calls Claude chat endpoint.
  - Uploads a sample file and verifies attachment handling.
  - Creates Stripe checkout session and asserts session url/id.
- Iterate until the script is consistently passing.

### Phase 2 — V1 App Development (MVP around proven core; minimal bulk changes)  ✅ COMPLETE
**Status: DONE & TESTED (backend 32/32 pass, frontend 19/19 pass, 100%).**
Implemented: dark glassmorphism responsive shell (desktop sidebar + mobile bottom nav + FAB drawer),
email/password + Google OAuth auth, 3-step onboarding, dashboard (metrics + recharts + active orders/requests),
marketplace (search/filter/sort/grid-list, 16 seeded services), service detail (pricing tiers, reviews, Stripe checkout dialog),
request builder, AEGIS AI assistant (OpenAI+Claude streaming SSE, prompt pills, file upload, provider selector),
messaging (conversation list + thread + polling + unread), profile + order history, provider listing creation.

**User stories**
1. As a visitor, I can browse a seeded marketplace and view service details with pricing.
2. As a client, I can use the AI Assistant to turn my need into a structured service brief.
3. As a client, I can create a service request from a guided builder and track its status.
4. As a user, I can start a test-mode Stripe checkout from a service card and land on success/cancel.
5. As a user, I can navigate seamlessly on mobile (bottom nav) and desktop (sidebar) with dark glass UI.

**Steps**
- Run design_agent (after POC) to produce Tailwind tokens/components for: glass panels, typography scale, buttons, inputs, cards, nav (mobile+desktop).
- Backend (FastAPI + MongoDB):
  - Core collections: users (unauth v1 optional), services (seeded), orders, chats/messages, service_requests.
  - CRUD endpoints for services + service requests + orders.
  - Integrate the **already-working** POC LLM routes into `/api/ai/*` for the assistant.
  - Integrate Stripe checkout route into `/api/billing/*`.
- Frontend (React + Tailwind):
  - App shell: responsive nav (bottom tabs / sidebar), dark glass layout.
  - Screens: Auth placeholder (disabled in v1), Onboarding stub, Dashboard, Marketplace, Service Details, Request Builder, AI Assistant (chat + file upload + provider selector), Messages (MVP list + thread), Profile/Settings.
  - State/data: React Query (or equivalent) for API calls, optimistic UI for chat send.
- Seed data: realistic services/providers, categories/tags, a few sample reviews.
- Conclude Phase 2: one round of end-to-end testing (manual + automated smoke) across core flows.

### Phase 3 — Auth + Onboarding + Messaging upgrade (production-friendly)
**User stories**
1. As a user, I can sign up with email/password and my profile persists.
2. As a user, I can sign in with Google OAuth and return without re-onboarding.
3. As a user, I can complete a 3-step onboarding survey and see my dashboard personalized.
4. As a client/provider, I can message in near-real-time (polling or websockets) and see delivery states.
5. As a provider, I can create/edit my service listings and manage incoming requests.

**Steps**
- Implement Emergent-managed Google OAuth + email/password auth:
  - Session/JWT handling, protected routes, user profile creation.
  - Ensure preview/deploy redirect URLs aligned with Emergent playbook.
- Onboarding: role (Client/Provider), interest categories, notification prefs; gate main app until completed.
- Messaging: upgrade from MVP to robust (polling refresh + unread counts; websockets only if needed).
- Orders: connect checkout success to order creation; add webhook handler (test mode) if required.
- Conclude Phase 3: end-to-end test of authenticated flows + multi-user scenarios.

### Phase 4 — Hardening, PWA, and polish
**User stories**
1. As a user, I can install the app as a PWA and it loads fast on mobile.
2. As a user, I can recover from errors (network/payment) with clear UI and no data loss.
3. As a user, I can filter/search services quickly and save favorites.
4. As a user, I can export/download a service brief generated by AI.
5. As an admin (internal), I can moderate seeded content and manage services/orders.

**Steps**
- PWA: manifest, icons, caching strategy, offline-friendly shell.
- Observability: structured logs, request IDs, error boundaries.
- Security: upload validation, rate limits, basic abuse prevention for AI.
- Performance: lazy-load routes, skeleton states, index key DB fields.
- Final UX pass: consistent glass components, accessibility, responsive edge cases.

## 3) Next Actions
1. Retrieve Emergent integration playbooks for Universal LLM (OpenAI+Claude + file) and Stripe Checkout (test mode).
2. Websearch best practices for Stripe checkout + webhook handling (test) and file upload handling in FastAPI.
3. Implement minimal POC endpoints + create `test_core.py` to validate: OpenAI, Claude, file attach, Stripe checkout session.
4. Run `test_core.py`, fix until all checks pass.
5. After POC passes, run design_agent and start Phase 2 build (frontend + backend together) using proven endpoints.

## 4) Success Criteria
- Phase 1: `python test_core.py` passes consistently (OpenAI reply, Claude reply, file accepted/processed, Stripe session created with valid url/id).
- Phase 2: User can browse marketplace → view service → start checkout (test) and use AI assistant (with file upload) in a polished responsive UI.
- Phase 3: Users can sign in (email+password, Google OAuth), complete onboarding, create requests, message, and see orders tracked.
- Phase 4: PWA installable, robust error handling, performance acceptable on mobile, no major regressions after full test sweep.
