# Cyber Rakshak Architecture

## 1. Architecture Goal

The hackathon prototype should look and feel like an AI-powered government reporting portal while staying simple enough to build quickly. There is no backend, no real AI service, no live OTP, and no real complaint submission. All state can live in the browser using mock data.

## 2. Suggested Frontend Stack

Recommended:

- React or Next.js for screen routing and component structure.
- TypeScript for safer mock complaint data.
- CSS modules, Tailwind, or a small design-token stylesheet.
- Framer Motion or GSAP for the homepage transformation animation.
- Canvas for particle animation.
- Local browser state for chat progress.

If the prototype is built as a static demo, Vite + React is enough.

## 3. High-Level System

```mermaid
flowchart LR
    U[Citizen or judge] --> FE[Cyber Rakshak frontend]

    subgraph Browser["Browser-only demo"]
        FE --> H[Homepage animation]
        FE --> A[Dummy auth flow]
        FE --> C[Chat complaint builder]
        C --> AI[Mock AI classifier]
        C --> S[Complaint draft state]
        S --> P[Complaint preview generator]
        P --> R[Dummy submission result]
    end

    AI --> S
    A --> S
    R --> ACK[Mock acknowledgement number]

    EXT[No backend or real government submission] -. demo boundary .- FE
```

## 4. App Routes

```mermaid
flowchart TD
    HOME["/ Homepage"] --> LOGIN["/login Dummy OTP"]
    HOME --> TRACK["Track complaint demo"]
    LOGIN --> CHAT["/chat AI complaint assistant"]
    CHAT --> PREVIEW["/preview Complaint preview"]
    PREVIEW --> SUCCESS["/success Dummy acknowledgement"]
    SUCCESS --> HOME
    CHAT --> HOME
```

## 5. Component Map

```mermaid
flowchart TD
    AppShell --> Header
    AppShell --> LanguageToggle
    AppShell --> Emergency1930Pill
    AppShell --> HomePage
    AppShell --> LoginPage
    AppShell --> ChatPage
    AppShell --> PreviewPage
    AppShell --> SuccessPage

    HomePage --> PortalTransformHero
    HomePage --> TrustCues
    HomePage --> StartReportCTA

    LoginPage --> MobileNumberForm
    LoginPage --> StateSelect
    LoginPage --> OtpForm
    LoginPage --> DemoLoginButton

    ChatPage --> ChatThread
    ChatPage --> ChatComposer
    ChatPage --> SuggestedReplyChips
    ChatPage --> EvidenceUploader
    ChatPage --> ComplaintSummaryPanel
    ChatPage --> CategoryConfidenceCard
    ChatPage --> Emergency1930Pill

    PreviewPage --> ComplaintPreview
    PreviewPage --> EditableFieldGroup
    PreviewPage --> SubmitDemoButton

    SuccessPage --> AcknowledgementCard
    SuccessPage --> TrackComplaintCTA
```

## 6. Mock Data Model

```ts
type ComplaintCategory =
  | "women_child_related_crime"
  | "financial_fraud"
  | "other_cybercrime";

type ComplaintDraft = {
  acknowledgementId?: string;
  language: "en" | "hi";
  category?: ComplaintCategory;
  subCategory?: string;
  confidence?: number;
  complainant: {
    name?: string;
    mobile?: string;
    state?: string;
  };
  incident: {
    summary?: string;
    date?: string;
    time?: string;
    platform?: string;
    location?: string;
    description?: string;
  };
  financial?: {
    amountLost?: number;
    paymentMethod?: string;
    transactionId?: string;
    bankOrWallet?: string;
  };
  suspect?: {
    phone?: string;
    email?: string;
    url?: string;
    socialHandle?: string;
    upiId?: string;
  };
  evidence: Array<{
    id: string;
    name: string;
    type: string;
    mockSize: string;
  }>;
};
```

## 7. Mock AI Classifier

The demo classifier can use keyword rules. This keeps the prototype reliable during judging.

Example logic:

```mermaid
flowchart TD
    S[Incident summary] --> F{Contains financial keywords?}
    F -->|upi, otp, bank, money, transaction, loan| FC[Financial Fraud]
    F -->|No| W{Contains women or child safety keywords?}
    W -->|child, minor, woman, harassment, stalking, blackmail| WC[Women or Child Related Crime]
    W -->|No| OC[Other Cybercrime]

    FC --> E[Show Call 1930 now CTA]
    WC --> Q[Ask privacy-sensitive follow-up questions]
    OC --> G[Ask general cybercrime follow-up questions]
```

The UI should present the result as an assistant suggestion, not a final legal decision.

Example:

```text
"This looks like Financial Fraud. I will prepare the complaint under that category unless you want to change it."
```

## 8. Chat Flow State Machine

```mermaid
stateDiagram-v2
    [*] --> AskSummary
    AskSummary --> ClassifyCategory
    ClassifyCategory --> ShowEmergency1930: financial fraud likely
    ClassifyCategory --> AskIncidentTime: no urgent fraud signal
    ShowEmergency1930 --> AskIncidentTime
    AskIncidentTime --> AskPlatform
    AskPlatform --> AskLocation
    AskLocation --> AskCategorySpecificDetails
    AskCategorySpecificDetails --> AskSuspectDetails
    AskSuspectDetails --> AskEvidence
    AskEvidence --> GeneratePreview
    GeneratePreview --> SubmitDemo
    SubmitDemo --> Success
    Success --> [*]
```

## 9. Category-Specific Questions

### Financial Fraud

- How much money was lost?
- When did the transaction happen?
- Which payment method was used?
- Do you have a transaction ID or UTR number?
- Do you know the caller, UPI ID, account number, app, or website involved?
- Have you called 1930 yet?

### Women/Child Related Crime

- Is the affected person a woman, child, or guardian reporting on behalf of someone?
- What platform did this happen on?
- Is there immediate danger or ongoing threat?
- Do you have screenshots, profile links, phone numbers, or chat records?
- Would the user prefer privacy-sensitive reporting language?

### Other Cybercrime

- Was an account hacked?
- Was there phishing, malware, impersonation, or fake profile activity?
- Which platform or website was involved?
- What evidence is available?
- Is the issue still ongoing?

## 10. Homepage Animation Architecture

Recommended approach:

```mermaid
flowchart LR
    A[Old portal screenshot layer] --> B[Sample screenshot colors]
    B --> C[Create capped canvas particles]
    C --> D[Scroll progress drives disintegration]
    D --> E[Particles swirl in tricolor path]
    E --> F[Particles form Cyber Rakshak mark]
    F --> G[Fade in real homepage UI]

    RM[Reduced motion preference] --> SF[Static before and after fallback]
    SKIP[Skip animation control] --> G
```

1. Show the old portal screenshot as a flat image layer.
2. Use canvas particles sampled from the screenshot or generated in tricolor clusters.
3. On scroll, fade and break the screenshot into particles.
4. Move particles in a circular swirl using requestAnimationFrame.
5. Resolve the particles into the Cyber Rakshak wordmark or homepage layout silhouette.
6. Fade in actual homepage UI after the animation completes.

Performance guidance:

- Cap particles around 1,200 to 2,000 for laptops.
- Use reduced particle count on mobile.
- Respect `prefers-reduced-motion`.
- Include a `Skip animation` control.
- Use a static fallback image if canvas fails.
- Avoid animating layout-heavy DOM nodes during the transformation.

## 11. Language Architecture

Demo languages:

- English
- Hindi

Future roadmap:

- Tamil
- Telugu
- Kannada
- Malayalam
- Bengali
- Marathi
- Gujarati
- Punjabi
- Odia
- Assamese

Implementation for demo:

- Store UI copy in a small local dictionary.
- Use `language` on the complaint draft.
- Translate only key UI labels, chat prompts, and CTA text for the demo.
- Show regional languages as disabled or "Coming soon" in the language menu.

## 12. Privacy and Safety

Because this is a demo:

- Show a visible "Demo only, no real complaint submitted" label.
- Do not ask judges to enter real personal data.
- Use sample files for evidence upload.
- Keep all data in memory or local browser state.
- Clear demo state with a reset button.

## 13. Submission Simulation

On demo submit:

```text
Generate acknowledgement ID:
CR-2026-08-0001930

Status:
Submitted for demo review

Next step:
Track complaint from dashboard
```

No network request is required.
