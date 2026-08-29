# Cyber Rakshak (साइबर रक्षक) 🛡️🇮🇳

> **Citizen-First, AI-Guided Cybercrime Reporting for India**  
> *Transforming confusing, bureaucratic filing into a compassionate, structured, and rapid response experience.*

---

## 📌 Executive Summary & Vision

Every year, millions of Indian citizens fall victim to financial frauds, social media extortion, harassment, phishing, and identity theft. Traditional cybercrime reporting portals present intimidating, complex multi-page legal forms that overwhelm victims during critical moments—especially during the **"Golden Hour"** (the first 2–3 hours) when stolen funds can still be frozen by cyber police and partner banks.

**Cyber Rakshak** reimagines cybercrime reporting in India as an intelligent, conversational, and accessible public service prototype. By combining conversational AI intake, instant incident classification, emergency 1930 helpline guidance, adaptive questioning, and structured review, Cyber Rakshak empowers any citizen—regardless of digital literacy—to prepare and submit an official-grade cybercrime complaint draft in minutes.

---

## 🌟 Key Features & Capabilities

### 1. 🔄 Legacy-to-Modern Scroll Transformation
- **Before / After Comparison**: Interactive visual scroll on the homepage that dissolves the friction of legacy multi-page portals into the modern Cyber Rakshak guided experience.
- **Tricolor Visual Polish**: Thoughtfully adheres to the Indian Digital Public Good design system (Paper-White `#FFFDF7`, Deep Navy `#0B1F3A`, Chakra Blue `#1A4E9A`, Saffron `#FF8F1F`, and India Green `#138A43`).

### 2. ⚡ 2-Step Login & Guest Evaluation Mode
- **Zero-Friction Authentication**: Quick login with Indian 10-digit mobile number and State/UT selection.
- **Deterministic Mock OTP**: Automatically supports quick fill with demo OTP `123456`.
- **Continue as Guest**: Instant access for judges, evaluators, and citizens in urgent distress.

### 3. 💬 Conversational Intake & Instant AI Classification
- **Natural Language Input**: Citizens explain what happened in everyday language.
- **Deterministic Incident Classifier**: Automatically categorizes incidents with confidence scores and explainable rationale across:
  - 💳 **Financial Fraud** (UPI scams, bank debit alerts, KYC expiration phishing, fake loans)
  - 🛡️ **Women / Child Related Crime** (Cyber stalking, blackmail, morphed images, extortion)
  - 💻 **Other Cybercrime** (Social media account hacking, phishing links, malware/ransomware, identity theft)
- **Category Confirmation & Switching**: Citizens maintain full autonomy to confirm or adjust classifications at any point.

### 4. 🚨 1930 "Golden Hour" Emergency Guidance
- **Immediate Financial Freezing Advisory**: Instant, persistent high-priority callout whenever financial fraud is detected or monetary deduction is reported.
- **Direct 1930 Dialing**: Direct `tel:1930` click-to-call link for the National Cybercrime Reporting Portal helpline.

### 5. ❓ Adaptive Guided Question Sequences
- **Category-Tailored State Machine**: Sequentially prompts for essential details (incident timestamp, amount lost, payment channel/app, transaction UTR, suspect identifiers, and impacted platform).
- **"Why We Ask This" Supportive Context**: Demystifies technical terms (such as UTR numbers or social media handles) with friendly, empowering explanations.
- **Quick Option Chips & Free Text**: Faster input via suggested answer chips with full support for typing custom details.

### 6. 📎 In-Browser Supporting Evidence Management
- **Local File Attachment**: Drag-and-drop or select screenshots, PDFs, transaction SMS alerts, or chat exports.
- **Pre-baked Sample Proof Chips**: Quick one-click sample evidence (`UPI Debit SMS`, `WhatsApp / Instagram Chat Export`, `Phishing URL Screenshot`) for zero-friction evaluation.
- **Local File Validation**: Client-side format (PNG, JPG, WEBP, PDF, DOCX) and size (10 MB per file) validation without uploading to external servers.

### 7. 📋 Structured Review & Real-Time Editable Preview
- **Official Review Card**: Grouped sections for Complainant, Category, Incident Timeline, Financial Details, Suspect Identifiers, and Evidence.
- **In-Place Edit Mode**: Real-time form editing powered by React Hook Form and Zod validation schemas.
- **Citizen Declaration**: Required confirmation checkbox before submission.

### 8. 🎫 Official Acknowledgement Receipt & Timeline Tracking
- **Standardized Receipt ID**: Generates demo acknowledgement numbers in the format `CR-YYYY-MM-######`.
- **One-Click Copy & Print Summary**: Copy tracking ID to clipboard or launch browser print dialog.
- **Live Lifecycle Tracking**: Search and view real-time complaint progress stages (`Submitted`, `AI Verified`, `Sent to State Cyber Cell`, `Bank Freezing Notice Issued`).

### 9. 🌐 Bilingual Experience (English & Hindi)
- **Instant Language Switching**: Full UI localization across all pages and components with persistent selection in `localStorage`.
- **Extensible Architecture**: Structured i18n dictionary ready for additional scheduled regional Indian languages (Tamil, Telugu, Bengali, Marathi, Kannada, Gujarati).

### 10. ♿ Accessibility & Performance
- **WCAG 2.1 AA Compliant**: Semantic HTML5 landmarks, ARIA live regions, skip-to-content keyboard navigation, visible focus indicators, and reduced-motion animations.

---

## 🛠️ Technical Stack & Architecture

- **Core Framework**: React 19, TypeScript 5.9, Vite 8
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS v4, Lucide React icons
- **Animations & Micro-interactions**: Motion (Framer Motion v12) with `prefers-reduced-motion` fallbacks
- **State Management**: Zustand (with local persistence for language and complaint drafts)
- **Form Management & Validation**: React Hook Form v7, Zod v4, `@hookform/resolvers`
- **Unit & Component Testing**: Vitest v4, React Testing Library, `@testing-library/user-event`, Happy-DOM
- **End-to-End Testing**: Playwright v1.58 (Chromium)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.19+` or `v22.12+`
- **npm**: `v10+`

### Installation

```bash
# Clone repository
git clone https://github.com/vinodkrishna221/Cyber-Rakshak.git
cd Cyber-Rakshak

# Install dependencies
npm install

# Install Playwright browser binaries (for e2e testing)
npx playwright install chromium
```

### Running Locally

```bash
# Start local development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🧪 Verification & Test Suite

The codebase features comprehensive test coverage across unit, component, integration, and end-to-end levels:

| Test Suite | Scope | Command | Status |
| :--- | :--- | :--- | :--- |
| **Unit & Component Tests** | 21 test files, 233 tests (stores, classifier, translations, forms, pages) | `npm test` | ✅ 233 / 233 Passed |
| **End-to-End Test Suite** | 5 specs, 10 journeys (Primary Financial, Women/Child Safety, Keyboard flow, Smoke, Visuals) | `npm run test:e2e` | ✅ 10 / 10 Passed |
| **Production Build** | TypeScript compiler check & Vite production bundle generation | `npm run build` | ✅ Clean Build |

### Available npm Commands

```bash
# Development
npm run dev              # Launch Vite dev server

# Production Build
npm run build            # Typecheck and compile production bundle
npm run preview          # Preview local production build

# Testing
npm test                 # Run all 233 unit & component tests
npm run test:watch       # Run Vitest in interactive watch mode
npm run test:e2e         # Run all 10 Playwright end-to-end tests headless
npm run test:e2e:ui      # Run Playwright with interactive graphical UI
```

---

## 🧭 Routes Overview

| Route | Description | Key Interactions |
| :--- | :--- | :--- |
| `/` | **Homepage** | Interactive before/after scroll transformation, emergency 1930 banner, workflow steps, trust cues |
| `/login` | **Citizen Login** | Mobile number + State selection, OTP verification (`123456`), Continue as Guest |
| `/chat` | **Rakshak AI Assistant** | Conversational intake, automatic classification, emergency card, guided questions, evidence upload, live summary |
| `/preview` | **Complaint Review** | Structured summary card, in-place edit form with validation, citizen declaration, demo submit |
| `/success` | **Acknowledgement Receipt** | Official demo receipt with ID (`CR-YYYY-MM-######`), copy ID, print summary, track complaint |
| `/track` | **Complaint Tracking** | Acknowledgement lookup, progress stepper, status metadata, incident summary |

---

## 🔒 Intentional Demo Boundaries & Prototype Disclaimers

1. **Browser-Only Prototype**: All data processing, AI classification, draft persistence, and tracking lookup occur entirely in the client browser (`localStorage` / Zustand).
2. **Zero External Network Calls**: The prototype does **NOT** contact external government servers or actual police databases.
3. **No Real Legal Complaints Filed**: Submitting a report in this demo does not file an actual legal complaint with law enforcement. In a real emergency or cyber attack, citizens must dial **1930** or visit the official government portal at [cybercrime.gov.in](https://cybercrime.gov.in).
4. **Mock Authentication**: Uses deterministic mock OTP `123456` or Guest mode for zero-friction evaluation.
5. **Simulated Evidence Upload**: File attachments are read and validated locally; mock sample proof chips are provided for easy testing.

---

## 📄 License & Attribution

Developed as a modern public service prototype for citizen empowerment and digital safety across India.
