# Cyber Rakshak Incremental Delivery Plan

## How to use this plan

Build this prototype **one task at a time**. In a later conversation, say
`Task 01`, `Task 08`, etc. The implementation agent must first read this file
and the product reference documents (`prd.md`, `architecture.md`,
`design_system.md`, and `ui_layouts.md`), then complete only the requested
task unless a small prerequisite fix is essential.

Each task is independently reviewable and should leave the application in a
runnable state. Do not jump ahead, replace the browser-only demo with a backend,
or add a real AI/OTP/government integration.

### Required stack

Use exactly this frontend stack unless a task explicitly needs a small supporting
package:

- React, React DOM, TypeScript, and Vite
- React Router DOM for route-level navigation
- Tailwind CSS for styling and design tokens
- Lucide React for icons
- Motion for animation
- Zustand for persisted-in-browser application state
- React Hook Form, Zod, and `@hookform/resolvers` for validated forms
- Vitest, React Testing Library, and `@testing-library/user-event` for unit and
  component tests
- Playwright for end-to-end smoke tests

### Shared implementation rules

1. Keep all data in the browser. Use deterministic mock data and keyword-based
   classification; never make network calls or claim that a complaint was filed.
2. Preserve the calm, official visual direction in `design_system.md`: paper-white
   surfaces, deep-navy text, chakra-blue structure, restrained saffron/green, and
   red only for emergency guidance.
3. Support English and Hindi from the first UI task onward. Put strings in a
   typed translation dictionary rather than scattering conditionals in components.
4. Make keyboard navigation, visible focus states, semantic controls, accessible
   names, responsive layouts, and `prefers-reduced-motion` non-negotiable.
5. Use shared components and typed domain models. Avoid `any`, duplicated mock
   logic, giant page components, and nested card-heavy layouts.
6. Each task must add or update focused tests. Run relevant unit tests, a build,
   and formatting/type checks available in the repository before handing over.
7. If the task visibly changes a runnable screen, capture a screenshot at desktop
   and mobile viewport sizes as part of validation.

### Definition of done for every task

- The task's acceptance criteria are met without breaking earlier routes.
- New UI is responsive at a narrow mobile width and a desktop width.
- Tests cover the primary happy path plus the most important validation or edge
  case introduced by the task.
- `npm run build` and the relevant test command pass (or any limitation is
  explicitly documented in the hand-off).
- Update this plan only when a task's scope or status genuinely changes.

## Delivery order

| Task | Feature | Depends on | Status |
| --- | --- | --- | --- |
| 01 | Project foundation and quality tooling | — | Completed |
| 02 | Design tokens, shared shell, and language foundation | 01 | Completed |
| 03 | Home page, static hero, and responsive trust content | 02 | Completed |
| 04 | Home-page transformation animation and motion fallback | 03 | Completed |
| 05 | Demo login and OTP flow | 02 | Completed |
| 06 | Complaint draft store and mock classifier | 01, 02 | Completed |
| 07 | Chat shell, initial conversation, and category result | 05, 06 | Completed |
| 08 | Guided category-specific chat questions | 07 | Completed |
| 09 | Evidence collection and live complaint summary | 08 | Completed |
| 10 | Complaint preview and edit flow | 09 | Completed |
| 11 | Demo submission, acknowledgement, and tracking | 10 | Completed |
| 12 | Accessibility, responsive QA, and end-to-end polish | 04, 11 | Completed |

---

## Task 01 — Project foundation and quality tooling

**Goal:** Create the Vite React TypeScript application and configure the agreed
development, test, styling, and routing foundations.

**Deliverables**

- Install and configure every package in the required stack.
- Configure Tailwind CSS, a root stylesheet, path conventions, and an application
  entry point.
- Add React Router with placeholder route components for `/`, `/login`, `/chat`,
  `/preview`, `/success`, and `/track`.
- Configure Vitest + Testing Library and Playwright, with one basic render test
  and one route smoke test.
- Add clear npm scripts for development, build, unit testing, and Playwright.

**Acceptance criteria**

- A new contributor can run the app and visit every placeholder route.
- TypeScript compilation, production build, unit test, and Playwright smoke test
  have documented commands.
- The app has no backend dependency and no untyped global state.

## Task 02 — Design tokens, shared shell, and language foundation

**Goal:** Establish reusable visual primitives and the application-level UI that
all pages will share.

**Deliverables**

- Translate the documented palette, typography, spacing, radii, focus treatment,
  and breakpoints into Tailwind theme tokens.
- Build `AppShell`, `Header`, language toggle, primary/secondary button variants,
  an emergency 1930 CTA, and a simple Chakra-inspired assistant mark using
  Lucide icons/CSS (not a copied government logo).
- Add a typed English/Hindi translation dictionary and Zustand language preference
  that survives a refresh.
- Ensure every route can render inside the shell.

**Acceptance criteria**

- Toggling language changes shared labels and persists locally.
- Header navigation is responsive and keyboard accessible.
- Emergency CTA is visually distinct but not alarming outside fraud contexts.

## Task 03 — Home page, static hero, and responsive trust content

**Goal:** Deliver a polished, useful home page before adding the showcase motion.

**Deliverables**

- Implement the homepage layout from `ui_layouts.md` with a static before/after
  portal concept, brand headline, report and tracking CTAs, emergency strip, and
  three trust cues.
- Connect `Start a Report` to `/login` and `Track Complaint` to `/track`.
- Add a lightweight, clearly labelled demo tracking placeholder so the secondary
  CTA does not dead-end.
- Write component tests for CTA navigation and language text.

**Acceptance criteria**

- The page communicates the product value in the first viewport on desktop and
  mobile.
- No external screenshot or government assets are required.
- The static hero remains usable as the animation fallback.

## Task 04 — Home-page transformation animation and motion fallback

**Goal:** Add the hackathon before/after moment without hurting usability or
performance.

**Deliverables**

- Enhance only the home hero with a Motion-driven, scroll/progress-based
  transformation from a stylized legacy portal panel into Cyber Rakshak.
- Use saffron, white, green, and chakra-blue particles/shapes with a capped,
  performant implementation; do not introduce a canvas dependency unless needed.
- Add a visible `Skip animation` control and a `prefers-reduced-motion` static
  mode.
- Test the skip and reduced-motion paths.

**Acceptance criteria**

- Content, CTAs, and tab order remain available before, during, and after motion.
- Reduced motion does not autoplay decorative animation.
- The effect is smooth on a typical laptop and does not cause layout shifts.

## Task 05 — Demo login and OTP flow

**Goal:** Provide a short, credible entry flow that collects only mock identity
details needed for the draft.

**Deliverables**

- Build `/login` with mobile number, state selector, OTP step, visible demo OTP
  `123456`, guest-demo option, and language support.
- Use React Hook Form + Zod for mobile number, state, and OTP validation.
- Store mock complainant details in the central Zustand draft store.
- Route successful verification/guest continuation to `/chat`.

**Acceptance criteria**

- Invalid fields have accessible inline messages and cannot continue.
- OTP `123456` is accepted deterministically; no actual SMS is sent.
- Guest mode creates clearly dummy, non-personal complainant data.

## Task 06 — Complaint draft store and mock classifier

**Goal:** Implement the typed, reusable browser-only domain layer that powers the
assistant and later preview.

**Deliverables**

- Define the complaint model from `architecture.md`, typed chat messages, evidence
  metadata, and workflow state.
- Build a Zustand store with precise actions for updating/resetting the draft;
  persist only mock demo data locally.
- Implement deterministic keyword classification for Financial Fraud,
  Women/Child Related Crime, and Other Cybercrime, including subcategory,
  confidence, and financial-emergency flag.
- Unit-test category priority, confidence/output shape, emergency detection, and
  reset behavior.

**Acceptance criteria**

- Financial keywords take priority when a summary contains overlapping terms.
- The classifier is presented as a suggestion, never as legal certainty.
- The logic is independent of React UI components.

## Task 07 — Chat shell, initial conversation, and category result

**Goal:** Replace category-first form selection with the first meaningful guided
conversation.

**Deliverables**

- Implement `/chat` desktop two-column and mobile single-column layouts with
  thread, composer, suggested chips, category-confidence card, and summary stub.
- Start with the bilingual reassuring prompt; submit a summary to the mock
  classifier and show the suggested category.
- Show a persistent, prominent `Call 1930 now` action when financial fraud is
  detected, including clear non-legal urgent guidance.
- Support category confirmation/change without losing the summary.

**Acceptance criteria**

- Sending a summary produces deterministic assistant output and draft updates.
- The composer works with keyboard submission and has accessible labels.
- Financial emergency guidance is visible without trapping the user in a modal.

## Task 08 — Guided category-specific chat questions

**Goal:** Collect necessary incident details one question at a time, tailored to
the selected category.

**Deliverables**

- Implement the workflow state machine and question definitions described in
  `architecture.md` for financial fraud, women/child safety, and other cybercrime.
- Add suggested replies where helpful and permit free-text answers.
- Collect date/time, platform, location/state, category-specific details, suspect
  information, and a clear incident description.
- Explain why sensitive information is requested using plain, supportive language.

**Acceptance criteria**

- Question order is category-specific and answers update the correct typed fields.
- Users can change an answer or category without corrupting the draft.
- All three category paths have component tests through their question sequence.

## Task 09 — Evidence collection and live complaint summary

**Goal:** Make evidence needs clear and let users see a continuously prepared
complaint.

**Deliverables**

- Add a browser-only evidence picker that stores file metadata only (name, type,
  mock size); never upload files.
- Provide relevant evidence examples and remove controls.
- Complete the desktop summary panel and mobile expandable summary with category,
  confidence, required details, completion state, and evidence count.
- Enable `Preview Complaint` only once the minimum draft is complete.

**Acceptance criteria**

- Adding/removing evidence updates the summary immediately.
- File-selection errors and accepted types have accessible feedback.
- Mobile users can access the same summary information without obscuring chat.

## Task 10 — Complaint preview and edit flow

**Goal:** Convert the conversation into a reviewable, editable structured report.

**Deliverables**

- Implement `/preview` with clearly grouped complaint, incident, financial (when
  applicable), suspect, complainant, and evidence details.
- Use React Hook Form + Zod to edit applicable fields and write changes back to
  the store.
- Add warnings that this is a demo and the category is an assistant suggestion.
- Provide an explicit return-to-chat action and `Submit demo complaint` action.

**Acceptance criteria**

- The preview accurately reflects all supported category paths.
- Invalid edits cannot be submitted; error messages are accessible.
- Returning to chat and returning to preview retains draft changes.

## Task 11 — Demo submission, acknowledgement, and tracking

**Goal:** Finish the demo journey with an official-feeling result while being
unambiguous that no report was submitted externally.

**Deliverables**

- Implement deterministic mock submission that creates an acknowledgement ID in
  the documented `CR-YYYY-MM-######` style and stores a local status.
- Build `/success` acknowledgement card, next steps, return-home action, and
  tracking CTA.
- Replace the tracking placeholder with an accessible local-only lookup/status
  experience for the generated ID.
- Test submission, acknowledgement rendering, and a successful local tracking
  lookup.

**Acceptance criteria**

- The UI says clearly that this is a demo and no government system received data.
- Refreshing the browser retains the latest mock acknowledgement if persistence is
  enabled.
- Unknown tracking IDs show a helpful, non-erroring empty state.

## Task 12 — Accessibility, responsive QA, and end-to-end polish

**Goal:** Validate the integrated prototype and address the highest-value quality
gaps before presenting it.

**Deliverables**

- Audit routes for keyboard flow, focus visibility, semantics, contrast, screen
  reader names, reduced motion, and English/Hindi overflow.
- Verify desktop and mobile layouts for every route; remove visual regressions and
  dead ends.
- Add Playwright coverage for: home → guest login → financial-fraud chat →
  preview → submit → track, plus a non-financial category path.
- Add screenshot artifacts for key home, chat, preview, and success states.
- Document any intentional demo limitations in the README.

**Acceptance criteria**

- The primary journey passes in a clean browser context without manual state
  injection.
- The UI has no known critical accessibility blocker.
- All automated checks and production build pass.

## Deferred ideas (do not start without an explicit new task)

- Real authentication, backend APIs, databases, file upload/storage, live 1930
  calling, government integrations, and real AI model requests.
- Additional regional-language translations beyond English and Hindi.
- Real complaint-status integrations, analytics, notifications, or legal advice.
- Advanced canvas particle art beyond what is needed for a reliable demo.
