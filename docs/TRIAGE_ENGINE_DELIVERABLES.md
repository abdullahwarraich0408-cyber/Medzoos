# Deterministic Multi-Tier Clinical Triage — Deliverables

**Protocol version:** `2026-08-01`  
**Policy note:** Application triage policy — **not** a certified ESI/MTS claim.

## Principle

| Component | Responsibility |
|---|---|
| **LLM** | NLU, structured extraction, clarification wording, greeting polish |
| **Deterministic engine** | Red flags, triage level, protocols, exercise safety, risk rules |
| **Provider discovery** | Live Prisma doctors / labs / pharmacies |
| **React Native** | Render text, badges, action cards, navigate |

LLM output **cannot** override emergency, urgent, exercise contraindications, or clinical protocols.

---

## 1. Files created

### Backend

```
Backend/src/services/copilot/
  ClinicalTriagePipeline.js
  types/copilot.types.js
  triage/textNormalizer.js
  triage/redFlagEngine.js
  triage/riskFactors.js
  triage/urgencyRules.js
  triage/triageEngine.js
  extraction/extractionSchema.js
  extraction/extractionPrompt.js
  extraction/symptomExtractor.js
  protocols/clinicalProtocols.js
  protocols/specialtyMapping.js
  protocols/labMapping.js
  protocols/exerciseProtocols.js
  response/actionCardBuilder.js
  providers/providerDiscoveryService.js
  audit/triageAudit.js
Backend/tests/unit/copilot/triageEngine.test.js
```

### Mobile

```
app/medCare/src/lib/copilot/engines/localRedFlagEngine.ts
app/medCare/docs/TRIAGE_ENGINE_PLAN.md
app/medCare/docs/TRIAGE_ENGINE_DELIVERABLES.md
```

---

## 2. Files modified

| File | Change |
|---|---|
| `CopilotOrchestrator.js` | Messages routed through `ClinicalTriagePipeline` |
| `LlmService.js` | Greeting polish only; no clinical override; emergency blocks rewrite |
| `copilot.routes.js` | Added `POST /v2/copilot/triage` |
| `copilot.controller.js` / `service.js` / `validator.js` | Triage endpoint |
| `app/medCare/.../types.ts` | `TriageLevel`, new action types |
| `app/medCare/.../api/index.ts` | `copilotApi.triage` |
| `CopilotHomeScreen.tsx` | Handles `call_emergency`, structured deep links |
| `CopilotActionCard.tsx` / `CopilotMessageBubble.tsx` | New icons + triage/reason badges |
| `orchestrator.ts` (mobile) | Offline red-flag fast path |

---

## 3. Replaced / deprecated

- Backend regex intent → questions → soft risk score path for **message handling** replaced by triage pipeline.
- `generateCopilotTurn` retained but **must not** change triage; returns null on emergency.
- Family vault `POST /family-vault/copilot` unchanged (separate keyword Q&A).

---

## 4. API endpoints

| Method | Path | Auth |
|---|---|---|
| `POST` | `/api/v2/copilot/sessions` | customer |
| `POST` | `/api/v2/copilot/sessions/:sessionId/messages` | customer |
| `GET` | `/api/v2/copilot/sessions/:sessionId` | customer |
| `POST` | `/api/v2/copilot/triage` | customer |

### Request (`/triage`)

```json
{
  "message": "My back hurts",
  "answers": { "optional": "prior clarification" }
}
```

### Response

```json
{
  "triageLevel": "NEEDS_MORE_INFORMATION|EMERGENCY|URGENT|ROUTINE|SELF_CARE",
  "emergency": false,
  "reasonCode": "MISSING_CLINICAL_DETAIL",
  "reasoning": "...",
  "text": "...",
  "actions": [
    {
      "type": "book_doctor",
      "label": "Consult Orthopedic",
      "targetScreen": "DoctorsList",
      "params": { "specialty": "Cardiologist" },
      "navigation": { "tab": "Home", "screen": "Services", "params": { "screen": "DoctorsList", "params": { "specialty": "Cardiologist" } } }
    }
  ],
  "suggestedReplies": ["1–3 / 10", "4–6 / 10", "7–10 / 10"],
  "metadata": {
    "protocolVersion": "2026-08-01",
    "protocol": "lower_back_pain_mechanical",
    "specialty": "Orthopedic",
    "rulesTriggered": [],
    "redFlagsTriggered": [],
    "extractionSource": "llm|heuristic|bypassed"
  },
  "riskLevel": "critical|high|medium|low",
  "providers": { "doctors": [] }
}
```

Chat message responses include the same fields on the assistant message for RN rendering.

---

## 5. Triage levels

`EMERGENCY` · `URGENT` · `ROUTINE` · `SELF_CARE` · `NEEDS_MORE_INFORMATION`

---

## 6. Red-flag rules (Layer 1)

`CHEST_PAIN_RED_FLAG` · `STROKE_SYMPTOM` · `LOSS_OF_CONSCIOUSNESS` · `SEVERE_DYSPNEA` · `ANAPHYLAXIS` · `MAJOR_BLEEDING` · `POISONING_OVERDOSE` · `CAUDA_EQUINA_RED_FLAG` · `EXPLICIT_EMERGENCY`

Isolated “chest pain” alone is **not** automatic emergency.

---

## 7. Clinical protocol registry

`clinicalProtocols.js` — versioned protocols including mechanical back pain, fever, non-emergency chest, cough/cold, headache, rash, diabetic foot, wellness.

---

## 8. Prisma health context

Reuses `HealthContextLoader.js` → mapped to minimal triage context (age, conditions, meds, allergies, labs, appointments). Loaded **after** emergency fast path.

---

## 9. LLM extraction

`symptomExtractor.js` + Zod schema. Post-sanitize strips invented severity/duration. Failures → heuristic or `NEEDS_MORE_INFORMATION`.

---

## 10. Exercise safety

`exerciseProtocols.js` — blocks on cauda equina flags / severe pain; phased acute/subacute/maintenance when cleared.

---

## 11. Provider discovery

`providerDiscoveryService.js` queries live `Doctor` / `LabPartner` / `LabTest` / `Vendor`. Specialty strings match `FILTER_OPTIONS` (`Cardiologist`, not `Cardiology`). **Never** sent into the LLM prompt as a catalog.

---

## 12. Unit tests

`Backend/tests/unit/copilot/triageEngine.test.js` — 25 tests covering emergency, urgent, routine/self-care, clarification, exercise block, specialty normalize, action cards, pipeline.

```bash
cd Backend && npm test -- tests/unit/copilot/triageEngine.test.js
```

---

## 13. Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | No | Structured extraction + greeting polish |
| `OPENAI_MODEL` | No | Default `gpt-4o-mini` |

No new DB migration required (audit is in-memory + winston log).

---

## 14. Medzoos RN flow

1. Center tab → `CopilotHomeScreen`
2. Authenticated → `POST /v2/copilot/sessions` then messages
3. Backend red-flag → emergency cards (`tel:1122`) without LLM
4. Else extract → triage → ≤4 action cards with `navigation.tab/screen/params`
5. UI renders `triageLevel` / `reasonCode` / risk badge
6. Offline fallback: local red-flag engine + existing on-device orchestrator
