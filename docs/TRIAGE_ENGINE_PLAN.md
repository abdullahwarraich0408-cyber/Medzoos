# Deterministic Multi-Tier Clinical Triage — Implementation Plan

## Audit summary

Existing system: dual-engine (mobile TS + backend JS) with regex intent → questions → risk score → actions. Optional OpenAI rewrites greeting/assessment **text** but must not decide urgency. Gaps: LLM can soften emergency copy; backend actions lack `tab` nav; specialty strings mismatch doctor filters; no dedicated red-flag fast path; no schema-validated extraction; no audit trail.

## Conventions

- Backend stays **CommonJS JavaScript** under `Backend/src/services/copilot/`.
- Keep `/v2/copilot/sessions` for chat; add `POST /v2/copilot/triage` for explicit triage.
- Message pipeline will call the new triage engine so Medzoos chat becomes safety-first.
- LLM = extraction + wording only. Deterministic rules = triage, protocols, actions, providers.
- Providers queried live from Prisma — never invented by LLM.

## Phases

1. Types + schemas + red-flag engine
2. Structured extraction (LLM) + health context
3. Triage engine + protocols + exercise safety + action cards
4. Provider discovery + API wiring
5. React Native response rendering
6. Unit tests

## Protocol policy

Rules are an **application triage policy** (Medzoos Clinical Policy v2026-08-01), not a claim of certified ESI/MTS.
