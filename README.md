# NxtWave AI Project Passport (AIPP)
## Complete Full-Stack Growth Application & Organizer Console

A production-ready growth engineering application supporting the high-impact student acquisition campaign:
**"Build Your First AI Project in 60 Minutes"**

---

### Campaign & Product Specifications

| Constraint | Specification |
|---|---|
| **Goal** | **500 Confirmed Registrations** |
| **Audience** | Final-Year Engineering Students (Graduating 2025–2028) |
| **Workshop Offer** | "Build Your First AI Project in 60 Minutes" |
| **Format** | Free Live Online Workshop |
| **Campaign Duration** | 7-Day Growth Sprint |
| **Maximum Budget** | ₹2,000 Total Expenditure Ceiling |
| **Attribution** | URL-based referral code persistence (`?ref=CODE`), WhatsApp peer sharing, organic/direct tracking |
| **Visual Identity** | Official NxtWave Logo & Favicon • Jet Black (`#000000`), Secondary Black (`#0A0A0A`), Cerulean Blue (`#007BA7`), Neon Rose (`#FF2D95`), White (`#FFFFFF`) |

---

## 1. Quick Start & Local Development

### Prerequisites
- Node.js `v20.0.0` or higher (`v24.18.0` tested)
- npm `v10.0.0` or higher

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
# Running at: http://localhost:5173

# 3. Run automated test suite (25 tests across 5 test suites)
npm test

# 4. Run linter (Oxlint)
npm run lint

# 5. Build production bundle with TypeScript verification
npm run build
```

---

## 2. System Architecture

```
d:\NXT WAVE\
├── public/
│   ├── nxtwave-logo.png         # Official NxtWave transparent brand asset (1x)
│   ├── nxtwave-logo@2x.png      # Retina display brand asset (2x)
│   ├── favicon.svg              # Vector favicon with NxtWave N+Chevron brand geometry
│   ├── favicon.ico              # Standard multi-resolution icon
│   └── favicon.png              # PNG fallback icon (32x32, 192x192)
│
├── src/
│   ├── types/
│   │   └── index.ts             # Shared data contracts (Registrations, Metrics, Projects)
│   ├── lib/
│   │   ├── recommendation.ts    # Deterministic 36-combination project matching engine
│   │   ├── referral.ts          # Referral parsing, persistence, WhatsApp links, CSV export
│   │   ├── validation.ts        # Input validation (Email regex, grad years, lengths)
│   │   ├── services.ts          # Unified service layer (Supabase RPC + Demo session fallback)
│   │   ├── supabase.ts          # Supabase client singleton, auth helpers, config check
│   │   └── analytics.ts         # Privacy-preserving campaign telemetry
│   ├── data/
│   │   └── demoData.ts          # Clearly-labelled mock cohort & analytics calculators
│   ├── components/
│   │   ├── Nav.tsx              # Brand header with official logo & navigation
│   │   ├── DemoBanner.tsx       # Live vs Demo transparency badge
│   │   ├── CampusLeaderboard.tsx# Engineering campus participation table
│   │   └── StepIndicator.tsx    # Accessible 3-step progress bar
│   └── pages/
│       ├── LandingPage.tsx      # High-conversion workshop landing page
│       ├── FinderPage.tsx       # 3-question interactive project finder
│       ├── PassportPage.tsx     # Personalized AI Project Passport recommendation
│       ├── RegistrationPage.tsx # Secure registration form with referral auto-capture
│       ├── SuccessPage.tsx      # Confirmation passport, referral code & WhatsApp sharing
│       └── DashboardPage.tsx    # Protected organizer dashboard, 500 target, budget & export
│
├── supabase/
│   ├── migrations/
│   │   └── 20261028000001_create_aipp_schema.sql # Complete PostgreSQL DDL & RLS Policies
│   └── functions/
│       └── register/
│           └── index.ts         # Secure Deno Edge Function with CORS & validation
│
└── tests/
    ├── recommendation.test.ts   # Tests all 36 finder question permutations
    ├── validation.test.ts       # Tests form bounds, email regex, grad years
    ├── referral.test.ts         # Tests code syntax, WhatsApp link encoding
    ├── budget_and_analytics.test.ts # Tests ₹2,000 budget math, target tracking
    └── security_schema.test.ts  # Tests RLS enablement, RPC definer, secret protection
```

---

## 3. End-to-End Student Journey

1. **Workshop Landing Page (`/`)**:
   - Headline: *"Build Your First AI Project in 60 Minutes"*.
   - Communicates who the workshop is for, what students learn, and realistic 60-minute expectations.
   - Live schedule indicator: *"Live Online — Free online workshop for final-year engineering students"*.
   - Automatically detects and captures `?ref=CODE` from URL query parameters.

2. **Interactive Project Finder (`/finder`)**:
   - 3 focused questions: Interest, Current Skill Level, and Workshop Goal.
   - Real-time step progress indicator (Step 1 of 3) with full forward/backward state preservation.
   - Deterministic recommendation mapping: No hallucinated AI, no false promises.

3. **Personalized Project Passport (`/passport`)**:
   - Displays 1 of 4 curated starter projects:
     - *Resume Feedback Assistant* (Streamlit / Flask / Python)
     - *Student Expense Analyzer* (Python / pandas / matplotlib)
     - *Study Notes Summarizer* (Python / NLTK / extractive NLP)
     - *Campus FAQ Assistant* (Python / fuzzy matching / Streamlit)
   - Detailed personalized "Why" rationale, 3 concrete starter tasks, and explicit 60-minute scope.

4. **Streamlined Registration (`/register`)**:
   - Collects minimal essential information: Full Name, Email, College, Graduation Year (`2025`–`2028`), and auto-filled Referral Code.
   - Client and server-side validation against injection, whitespace, and invalid formats.
   - Duplicate prevention: Detects duplicate emails and recovers existing passport without double-counting.
   - Privacy notice: Personal data is collected solely for workshop access and attendance verification.

5. **Confirmation & Referral Sharing (`/success`)**:
   - Confirms workshop enrollment with unique passport card.
   - Generates unique referral code (e.g. `suresh-A1B2`).
   - One-click native Web Share, copy-to-clipboard, and pre-formatted WhatsApp group sharing link.

---

## 4. Supabase Database & Security Architecture

### Schema Overview (`supabase/migrations/20261028000001_create_aipp_schema.sql`)

- **`registrations`**:
  - `id`: UUID Primary Key (`gen_random_uuid()`).
  - `full_name`: Text (trimmed, max 100).
  - `email_normalized`: Text (lowercase, unique constraint `uq_registrations_email`).
  - `college`: Text (max 150).
  - `graduation_year`: Text (`2025`–`2028`).
  - `project_id`: Text (references recommended starter track).
  - `referral_code_used`: Text (foreign key to `referral_codes.code`).
  - `campaign_source`: Text (`direct`, `whatsapp`, `referral`, `organic`).
  - `created_at`: Timestamptz default `now()`.

- **`referral_codes`**:
  - `id`: UUID Primary Key.
  - `code`: Text Unique (format `[slug]-[hash]`).
  - `registration_id`: UUID Foreign Key referencing `registrations.id` ON DELETE CASCADE.
  - `created_at`: Timestamptz.

- **`campaign_events`**:
  - Anonymized telemetry events (`landing_view`, `finder_start`, `finder_complete`, `registration_attempt`, `registration_success`).
  - Contains no PII (no names, no emails).

- **`campaign_expenses`**:
  - Enforces the ₹2,000 maximum budget constraint.
  - Records expenditure description, amount in INR, category, and audit timestamp.

- **`admin_profiles`**:
  - Links to `auth.users(id)` with organizer role verification.

### Row-Level Security (RLS) & Atomic RPC

1. **RLS Enabled on All 5 Tables**:
   - Public anonymous users **cannot** read or list arbitrary student records.
   - Public SELECT on `registrations` is denied.

2. **Atomic Registration RPC (`register_student`)**:
   - Defined with `SECURITY DEFINER` and locked `search_path = public`.
   - Atomically inserts the student registration, generates their referral code, updates attribution, and returns only non-sensitive confirmation details.
   - Prevents self-referral (a student cannot use their own referral code).
   - Prevents race conditions and duplicate email collisions.

3. **Secure Dashboard RPC (`get_dashboard_metrics`)**:
   - Computes aggregated registration totals, budget spent, attribution breakdown, and daily trends without leaking student personal data.

---

## 5. Supabase Setup & Deployment Guide

Follow these exact steps to connect a live Supabase project:

### Step 1: Create Supabase Project
1. Log in to [Supabase](https://supabase.com) and click **New Project**.
2. Name the project `nxtwave-ai-passport` and set a strong database password.

### Step 2: Run Database Migration
1. Open the **SQL Editor** in the Supabase Dashboard.
2. Open `supabase/migrations/20261028000001_create_aipp_schema.sql` from this repository.
3. Paste the entire SQL script and click **Run**.
4. Confirm tables (`registrations`, `referral_codes`, `campaign_events`, `campaign_expenses`, `admin_profiles`) and functions (`register_student`, `record_campaign_event`, `get_dashboard_metrics`) are created.

### Step 3: Configure Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. In the Supabase Dashboard, navigate to **Project Settings → API**.
3. Copy **Project URL** and **Project API Key (anon/public)**.
4. Populate `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
   VITE_APP_BASE_URL=https://aipp.nxtwave.tech
   ```

### Step 4: Deploy Edge Function (Optional / Recommended)
If deploying Supabase Edge Functions:
```bash
# Login to Supabase CLI
npx supabase login

# Link project
npx supabase link --project-ref your-project-id

# Deploy registration function
npx supabase functions deploy register
```

### Step 5: Authorize Admin Organizer
In the Supabase SQL Editor, register an organizer account by linking your auth user ID:
```sql
INSERT INTO public.admin_profiles (user_id, email, full_name, role)
VALUES ('<USER-UUID-FROM-AUTH-USERS>', 'organizer@nxtwave.tech', 'Campaign Lead', 'super_admin');
```

---

## 6. Organizer Growth Dashboard (`/dashboard`)

The organizer dashboard provides real-time campaign control:

1. **Target Pace**: Visual progress bar tracking registrations toward the **500 student target**, showing percentage completed and students remaining.
2. **7-Day Velocity**: Daily registration curve using Recharts `AreaChart`.
3. **Channel Breakdown**: Live attribution between peer referrals, WhatsApp community groups, direct campus outreach, and organic traffic.
4. **Referral Growth & K-Factor**: Measures peer invite velocity (`referrals / primary registrations`) and top campus referrers.
5. **₹2,000 Budget Tracker**:
   - Total budget: ₹2,000.
   - Tracks actual expenses logged.
   - Interactive **"Log Campaign Expense"** modal to record real marketing costs (WhatsApp broadcast API, posters, hosting).
6. **Registrations Table**:
   - Real-time search across student name, college, email, or referral code.
   - Source filter dropdown.
   - Masked student emails in demo mode; unmasked for authenticated organizers.
   - One-click **CSV Export** with complete schema headers.

---

## 7. Testing & Quality Assurance

The project includes an automated test suite executed with Node's native test runner (`node --test --experimental-strip-types`):

```bash
npm test
```

### Verified Test Suites:
1. **`tests/recommendation.test.ts` (4 tests)**:
   - Validates all 36 permutations of Interest x Skill x Goal.
   - Confirms deterministic project mapping and realistic 60-minute task breakdown.
2. **`tests/validation.test.ts` (8 tests)**:
   - Validates required fields, character bounds (name, college).
   - Validates RFC-compliant academic and personal email regex.
   - Rejects consecutive dots (`..`) and malformed domains.
   - Enforces graduation years strictly (`2025`–`2028`).
   - Validates referral code formatting (`name-XXXX`).
3. **`tests/referral.test.ts` (3 tests)**:
   - Tests regex pattern verification for referral codes.
   - Tests pre-filled WhatsApp message encoding and link structure.
4. **`tests/budget_and_analytics.test.ts` (4 tests)**:
   - Enforces the strict ₹2,000 ceiling.
   - Verifies remaining balance and percentage utilization math.
   - Verifies attribution channel aggregation.
5. **`tests/security_schema.test.ts` (6 tests)**:
   - Verifies SQL migration file integrity.
   - Verifies Row-Level Security (RLS) is enabled on all 5 tables.
   - Verifies atomic RPC function uses `SECURITY DEFINER` with fixed `search_path`.
   - Verifies Edge Function server-side validation and CORS headers.
   - Verifies `.env.example` contains only safe placeholders without secret leaks.
   - Verifies `.gitignore` excludes `.env`.

**Test Results:** **25 passed, 0 failed (396ms execution time).**

---

## 8. Verification & Honest Current State

- **Brand Assets**: Official NxtWave logo and custom SVG/ICO/PNG favicons are generated and integrated.
- **Frontend Stack**: Built with React 19, TypeScript, Vite 8, and Tailwind CSS.
- **Zero Errors**: `npm run build` succeeds in 2.26s. `npm run lint` reports 0 warnings and 0 errors.
- **Backend Status**:
  - When Supabase credentials are not provided in `.env`, the application automatically runs in **Transparent Demo Mode** with clear UI badges (`[DEMO MODE]`, `[DEMO DATA]`), storing registrations in local session storage without pretending an external database is connected.
  - When Supabase credentials are provided in `.env`, the application seamlessly switches to live PostgreSQL transactions and Row-Level Security without code changes.
