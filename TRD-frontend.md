# Technical Requirements Document (TRD) — Japaika Frontend

## 1. Overview
This document specifies the technical architecture, component standards, data pipelines, and error protocols for the Japaika frontend SPA. Built on **React 19**, **Vite**, and **JavaScript**, the application interfaces with AI and Swiss-Ephemeris microservices to power personal Vedic readings, interactive calculators, and deep report previews.

---

## 2. Architecture & Data Flow

### 2.1 Core Stack
- **Runtime & Bundler**: React 19 (Plain JavaScript, no TypeScript) + Vite.
- **Styling & Design System**: Tailwind CSS v4 with CSS variables for dark/light themes (`src/styles/index.css`), glassmorphic panels, and shadcn/ui primitives.
- **State Management**: Redux Toolkit (RTK) organized feature-by-feature; asynchronous calls managed via `createAsyncThunk`.
- **Routing**: `react-router-dom` handling root layouts, nested routes, and route-level code splitting.
- **Supporting Libraries**: `lucide-react` (icons), `framer-motion` (micro-animations), `sonner` (notifications), `axios` (HTTP client), `react-helmet-async` (SEO metadata).

### 2.2 Feature-Based Modular Architecture
```text
src/
├── app/              # store.js & rootReducer.js
├── features/         # auth/, jyotish/, reports/, horoscope/, compatibility/, user/
│   ├── [feature]Slice.js
│   ├── [feature]Api.js (or [feature]Thunks.js)
│   └── components/
├── components/       # ui/ (shadcn primitives), layout/ (Header, Sidebar), common/
├── pages/            # Page-level view components (Home, Calculators, Reports, etc.)
├── hooks/            # Custom reusable hooks
├── lib/              # api-client.js, utils.js, constants.js
└── styles/           # index.css (Theme tokens & Tailwind v4 directives)
```

### 2.3 Data Flow Lifecycle
1. User triggers action in UI component.
2. Component dispatches Redux `createAsyncThunk` action.
3. Axios client (`src/lib/api-client.js`) attaches auth bearer headers, request timeout, and executes HTTP call.
4. Redux slice handles `pending`, `fulfilled`, or `rejected` actions.
5. UI displays animated loading skeletons, renders result data, or fires `sonner` toast on error.

---

## 3. APIs & Interfaces (Backend Placeholders)

### 3.1 Authentication & Profile (`features/auth`)
- `POST /api/v1/auth/send-otp` — `{ phone: string, countryCode: string }`
- `POST /api/v1/auth/verify-otp` — `{ phone: string, otp: string }` -> `{ token: string, user: object }`
- `GET /api/v1/auth/me` — Returns authenticated profile, charts, and question credit balance.
- `POST /api/v1/auth/logout` — Invalidates refresh tokens and terminates session.

### 3.2 Chart & Kundli Engine (`features/user`, `features/compatibility`)
- `POST /api/v1/kundli/calculate` — `{ dob, tob, lat, lng, timezone, isTimeUnknown }`
- `POST /api/v1/kundli/bind` — Links generated chart metadata to the authenticated user account.

### 3.3 Conversational AI Engines (`features/jyotish`)
- `POST /api/v1/chat/jyotish` — Streamed chart-grounded consultation `{ query, threadId, chartId }`.
- `POST /api/v1/chat/shastra` — Public Vedic knowledge query `{ query, threadId }`.
- `GET /api/v1/chat/threads` — Retrieves past conversations and categorized question history.

### 3.4 Vedic Calculators (`features/calculators`)
- `POST /api/v1/calculators/:toolName` — `{ params }` (e.g., `sade-sati`, `kundli-milan`, `mangal-dosha`).

### 3.5 Reports & Monetization (`features/reports`)
- `GET /api/v1/reports` — Fetches list of available reports, pricing, and sample outlines.
- `POST /api/v1/billing/checkout` — Initializes checkout session for question packs or deep reports.

---

## 4. Error Handling & Edge Cases

- **Global Error Boundary**: Catches unhandled React render tree crashes with a graceful fallback screen and reload button.
- **Axios HTTP Interceptor**:
  - `401 Unauthorized`: Clears expired session state and opens Chart Binding / Login modal.
  - `429 Rate Limited`: Dispatches toast notification with exponential retry advisory.
  - `5xx Server Error`: Renders non-blocking retry alert without clearing current user form inputs.
- **Edge Cases**:
  - *No Birth Time Given*: UI automatically adapts calculation requests to solar-moon thematic mode.
  - *Network Interruption*: SSE / streaming chat automatically flags dropped connections and displays a "Retry generating" button.

---

## 5. Validation & Monitoring

- **Form Validation**: Birth coordinates, dates, and phone numbers validated using lightweight schema helpers before thunk dispatch.
- **UI State Integrity**: Every API-driven component strictly implements loading skeletons (`src/components/ui/skeleton`) and empty states.
- **Web Vitals & Performance**: Vite chunking strategy splits vendor dependencies; code splitting via `React.lazy` on page routes; target LCP < 2.5s.
- **SEO & Meta**: `react-helmet-async` ensures dynamic page titles, canonical URLs, and OpenGraph images across all routes.

---

## 6. Risks & Rollback

- **Risks**:
  - *AI Response Latency*: Mitigated by streaming SSE responses with immediate typing feedback.
  - *Large Chart Calculation Bundles*: Ephemeris calculations isolated to backend microservices, keeping frontend JS bundle minimal.
- **Rollback Strategy**:
  - Atomic production builds using Vite static output (`dist/`).
  - Deployments version-tagged in Git; instant rollback achievable by reverting web server symlink to the previous build artifact.
