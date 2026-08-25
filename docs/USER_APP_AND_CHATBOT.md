# Medzoos patient app and Health Copilot

How the React Native user app works, and how the center-tab Medzoos chatbot turns a message into a next care step.

**App:** `app/medCare/` (branded Medzoos)  
**Backend:** `Backend/` at `https://backend.medzoos.com/api`  
**Last updated:** August 2026

This is an architecture map of the current code, not a product spec.

---

## 1. What the user app is

Medzoos is a Pakistan healthcare platform. The patient mobile app lets a user:

- Find and book doctors (online or in-person)
- Book lab tests (home collection or walk-in)
- Order medicines from partner pharmacies
- Keep a health record and family profiles
- Join a health community
- Chat with **Medzoos Health Copilot** (center tab)

The same backend also powers the website (`Frontend/Frontend`).

---

## 2. Boot and shell

```
Splash
  → QueryProvider (React Query)
  → AuthProvider
  → NotificationProvider + LocationProvider + CartProvider
  → AppNavigator
```

**Key files**

| Piece | Path |
|---|---|
| Entry | `app/medCare/App.tsx` |
| Navigator | `src/navigation/AppNavigator.tsx` |
| API base URL | `src/config/api.ts` |
| API client | `src/lib/api/index.ts` |
| Auth | `src/lib/auth/AuthContext.tsx` |

### Who sees what

1. First launch → onboarding, then Sign In or Register.
2. Signed in but profile incomplete (placeholder emails like `@firebase.medzoos.local`) → Complete Profile.
3. Signed in with a complete profile → drawer wrapping five bottom tabs.

Live API is `https://backend.medzoos.com/api`. Set `USE_LOCAL_API = true` in `src/config/api.ts` to hit a PC backend on port 5000.

---

## 3. Authentication

Supported methods:

- Email + password
- Phone OTP (Firebase)
- Google
- Apple

Firebase proves identity. The app then exchanges the ID token for a **Medzoos session** (access token + refresh token) via `/auth/firebase`, `/auth/google`, or `/auth/apple`.

Tokens are stored on device. Refresh uses `/auth/refresh`. Logout can be this device or all devices.

**Auth-gated actions** (booking, checkout, posting) prompt sign-in and can resume the pending action after login.

---

## 4. Shared providers

| Provider | Role |
|---|---|
| **Auth** | Session, user, login/logout, `requireAuth` |
| **Cart** | Guest cart on device; after login it merges into `/customer/cart` |
| **Location** | Nearby pharmacies, labs, home collection |
| **Notifications** | Push + in-app unread count |
| **Payments** | Stripe checkout; COD on some flows |

---

## 5. Navigation map

A **drawer** wraps **five tabs**. The center tab is labelled **Medzoos** (the chatbot).

### Bottom tabs

| Tab | Root screen | Stack | What the user can do |
|---|---|---|---|
| **Home** | Dashboard (`HealthDashboardPage`) | `HomeStack` | Greeting, search, promos, categories, recent visits, checkup schedule, care actions. Opens doctors, labs, pharmacies, prescriptions. |
| **Medzoos** (center) | `CopilotHome` | `CopilotStack` | Chat with Health Copilot. Quick examples, suggested replies, risk badge, action cards that deep-link into the rest of the app. |
| **Health** | `HealthHome` | `HealthStack` | Attention items, medicines, cart/checkout, lab reports, medical records, family profiles, upload documents, health history. |
| **Community** | `CommunityHome` | `CommunityStack` | Posts, groups, challenges, buddies, weekly report. Auth-gated create/join. |
| **You** | `YouHome` | `YouStack` | Profile, addresses, payments, notifications, settings, support, orders, appointments, video consult, doctor chat. |

### Drawer screens

Hospitals · Pharmacies · Offers · Prescriptions · Help · Contact

---

## 6. Main product flows

### 6.1 Doctors and consultations

```
Home → Services (ConsultHome)
  → specialties / hospitals
  → doctor profile
  → pick slot (online or in-person)
  → pay
  → appointment under You
```

- Slots come from `/doctors/:id/slots`.
- Booking posts to `/doctors/appointments`.
- Online consults open **AppointmentChat** and **AppointmentVideo** (Jitsi room named `Medzoos_<id>`).

**Stack:** `src/navigation/DoctorsStack.tsx` (also nested from Home as Services).

### 6.2 Lab tests

```
Catalog → lab detail → cart
  → home collection or walk-in
  → Stripe (home) or Stripe/COD
  → reports in Health
```

Home collection requires online payment. Walk-in can use Stripe or COD.

### 6.3 Medicines

```
Health → MedicinesList → product → cart → checkout
```

Guests can add items locally. After login the cart merges to `/customer/cart`. Checkout uses a delivery address and Stripe/COD.

Prescriptions can be uploaded from the drawer and tracked as orders. Uploaded records are labelled **patient-uploaded**, not issued by a Medzoos doctor.

### 6.4 Health record and family

Health hub shows attention items, active medicines, and a timeline.

Family profiles store members, medicines, documents, and history. That record is what the chatbot personalizes against.

### 6.5 Community

Feed of posts (text / photo / video), groups, challenges, buddies, weekly report. Creating or joining requires auth.

### 6.6 You (account)

Orders (medicines, labs, doctors, hospitals, prescriptions), appointments, profile, addresses, payments, notifications, settings, support.

---

## 7. How the Medzoos chatbot works

The center tab is **Health Copilot**. It is a guided care assistant, **not** a free-form doctor and **not** a diagnosis engine.

Every assistant reply includes:

> These are educational hypotheses only — not a diagnosis. Only a qualified clinician can diagnose and treat you.

### 7.1 Where it lives

| Layer | Path |
|---|---|
| Chat UI | `src/features/copilot/CopilotHomeScreen.tsx` |
| Hook | `src/lib/copilot/useCopilot.ts` |
| On-device engine | `src/lib/copilot/orchestrator.ts` + `engines/` |
| Types | `src/lib/copilot/types.ts` |
| Server engine | `Backend/src/services/copilot/CopilotOrchestrator.js` |
| Health context | `Backend/src/services/copilot/HealthContextLoader.js` |
| Optional LLM | `Backend/src/services/copilot/LlmService.js` |
| HTTP | `POST /api/v2/copilot/sessions` (customer JWT only) |

### 7.2 Dual engine

1. **Logged in** → app calls `POST /api/v2/copilot/sessions`. Messages go to `POST /api/v2/copilot/sessions/:id/messages`.
2. **Guest, or API down** → the TypeScript orchestrator runs **on the phone**.

If a remote send fails mid-chat, `useCopilot` silently switches to the local engine and continues.

On the server, sessions live in an **in-memory Map** (lost on restart). OpenAI is optional: with `OPENAI_API_KEY` it only **rewrites wording**. Risk score and action buttons still come from rules.

### 7.3 Pipeline (same 6 steps on phone and server)

```
Greeting → Intent → Questions → Risk → Recommendations → Actions
```

| Phase | What happens | Shown in the UI |
|---|---|---|
| **1. Greeting** | Load health context (name, age, conditions, upcoming appointments, labs, family). Time-of-day greeting. Server may rewrite it with OpenAI. | “Reading your health context…” then chips: chest pain, doctor, lab report, missed medicine. |
| **2. Intent** | Regex rules, highest priority wins. Emergency beats symptoms, which beat medicine, labs, doctor, family, etc. | “Understanding your request” |
| **3. Questions** | Symptoms (especially chest pain or fever) get a short questionnaire. Known facts from the health record are skipped. | “Gathering details” + option chips |
| **4. Risk** | Score from answers + record. Emergency = critical. Chest pain adds radiating pain, breathlessness, sweating, age ≥45, smoking, diabetes/heart. | Risk badge: low / medium / high / critical |
| **5. Recommendations** | Educational differentials (not a diagnosis) + reasoning. Server may let OpenAI rewrite copy as JSON `{ text, suggestedReplies, reasoning }`. | Message body + disclaimer |
| **6. Actions** | Up to 4 cards: book doctor, book lab, order medicine, rest plan, family, or Call 1122. Tapping navigates into the matching tab/screen. | “Ready — choose your next step” |

**Emergency** skips questions and goes straight to assessment.

### 7.4 Intents

On-device engine has a richer list than the server, but both share the same idea.

| Intent | Example phrasing | Typical next step |
|---|---|---|
| `emergency` | ambulance, 1122, can't breathe | Call 1122 + find emergency care |
| `symptoms` | chest pain, fever, headache, cough | Questions → risk → doctor / labs / rest |
| `medicine` | missed dose, refill, reminder | Medicines list + reminder |
| `prescription` | upload prescription | Prescriptions drawer |
| `lab` / `report` | book lab, explain CBC / HbA1c | Lab tests list |
| `doctor` / `appointment` | cardiologist, follow-up | Doctors list (specialty if detected) |
| `mental_health` | anxiety, insomnia | Psychiatry match |
| `lifestyle` / `vaccination` | diet, exercise, flu shot | Health hub guidance |
| `family` | mother, child | Family profiles |
| `insurance` / `health_advice` | coverage, checkup | General doctor or Health home |
| `general` | anything unmatched | Generic doctor / medicine / lab cards |

Specialty hints from wording: chest/heart → Cardiology, skin → Dermatology, stomach → Gastroenterology, child → Pediatrics, fever/cough → General Physician.

### 7.5 Risk scoring (chest pain example)

Starts at **+30** for chest pain, then:

| Factor | Points |
|---|---|
| Pain radiates to arm / jaw / neck | +20 |
| Shortness of breath | +20 |
| Sweating / clammy | +15 |
| Severity 9–10 | +25 |
| Diabetes / heart / hypertension on file | +15 |
| Age ≥ 45 | +10 |
| Smoking | +10 |
| Sudden onset | +10 |

**Levels:** score ≥ 70 critical · ≥ 50 high · ≥ 25 medium · else low.

Explicit emergency language is always **critical**. Fever uses temperature and duration. Copy always urges **1122** when red flags are present.

### 7.6 Tappable actions

| Action type | User sees | Where it goes |
|---|---|---|
| `emergency_alert` | Call emergency (1122) | `tel:1122` |
| `book_doctor` | Book GP / Cardiologist / matched doctors | Home → Services → DoctorsList |
| `book_lab` | Book ECG, CBC, or general labs | Home → Services → LabTestsList |
| `order_medicine` | Browse fever / cough / pain care | Health → MedicinesList |
| `health_plan` | Rest, hydration, pacing plan | Health → HealthHome |
| `family_notification` | Check family health | Health → FamilyProfiles |
| `schedule_reminder` | Set medicine reminder | Health → MedicinesList |

Actions are de-duplicated by label and capped at **4**, highest priority first.

### 7.7 Example: “I have chest pain”

1. Greeting loads the user’s context.
2. Intent = `symptoms` (chest).
3. Questions: where, when, radiation, severity, breath, sweating.
4. Risk scored from answers + age / smoking / heart conditions on file.
5. Differentials such as muscle strain, acid reflux, angina (labelled not a diagnosis).
6. Actions: **Call 1122** if critical, otherwise **Book Cardiologist**, optional ECG labs, rest plan.

### 7.8 Health context the chatbot uses

**Server** (`HealthContextLoader`) reads Prisma: user profile, upcoming doctor appointments, recent lab bookings, family vault, orders. Insights such as “You have a follow-up with Dr X on Fri”.

**Phone fallback** builds a similar object from `useHealthDashboard` (DOB, blood group, family members, medical records, reports, bookings, orders).

OpenAI (when enabled) receives first name, age, conditions, upcoming appointments, insights, session answers, and the rule-based result. It must return JSON only. Failures fall back to rule-based text.

---

## 8. Related but separate: family vault copilot

The website family vault has a **one-shot Q&A** at `POST /family-vault/copilot`. It answers from stored family records.

That is **not** the same session engine as the mobile Medzoos tab.

---

## 9. Safety rules

- Never claims to diagnose.
- Disclaimer on every assistant message.
- Emergency language → 1122 immediately.
- Chest-pain scoring is conservative (red flags raise risk quickly).
- Patient-uploaded documents are not labelled as Medzoos-issued.

---

## 10. File index

### App

```
app/medCare/
  App.tsx
  src/config/api.ts
  src/navigation/
    AppNavigator.tsx
    HomeStack.tsx
    CopilotStack.tsx
    HealthStack.tsx
    CommunityStack.tsx
    YouStack.tsx
    DoctorsStack.tsx
    AuthStack.tsx
    types.ts
  src/features/copilot/CopilotHomeScreen.tsx
  src/lib/copilot/
    useCopilot.ts
    orchestrator.ts
    types.ts
    engines/
      intentDetection.ts
      questionEngine.ts
      riskEngine.ts
      recommendationEngine.ts
      greetingEngine.ts
      healthContext.ts
```

### Backend

```
Backend/src/
  routes/index.js                  → mounts /v2/copilot
  modules/copilot/
    copilot.routes.js
    copilot.controller.js
    copilot.service.js
  services/copilot/
    CopilotOrchestrator.js
    HealthContextLoader.js
    LlmService.js
```

### API

| Method | Path | Auth |
|---|---|---|
| `POST` | `/v2/copilot/sessions` | customer |
| `GET` | `/v2/copilot/sessions/:sessionId` | customer |
| `POST` | `/v2/copilot/sessions/:sessionId/messages` | customer |

Body for send: `{ "message": "I have fever since last night" }`.
