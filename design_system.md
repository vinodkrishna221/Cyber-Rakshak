# Cyber Rakshak Design System

## 1. Design Direction

Cyber Rakshak should feel official, calm, fast, and protective. The visual language should borrow from the Indian flag without turning every surface into a literal tricolor banner. The UI should feel closer to a modern AI assistant than a traditional government form.

Design keywords:

- Trustworthy
- Human
- Clear
- Official
- Guided
- Accessible
- Calm under stress

## 2. Brand Name

Product concept:

```text
Cyber Rakshak
```

Assistant identity:

```text
Rakshak AI
```

Suggested tagline:

```text
Report cybercrime through a guided conversation.
```

Alternative short line:

```text
Tell us what happened. We will prepare the report.
```

## 3. Color Palette

### Core Colors

```css
--chakra-blue: #1A4E9A;
--deep-navy: #0B1F3A;
--saffron: #FF8F1F;
--india-green: #138A43;
--paper-white: #FFFDF7;
--mist: #F4F7FB;
--ink: #172033;
```

### Supporting Colors

```css
--alert-red: #C62828;
--warning-amber: #F6B73C;
--success-green: #1F9D55;
--border-soft: #D8E1EF;
--muted-text: #5B6577;
```

## 4. Color Usage

- Chakra blue: Header, assistant avatar, key active states, trust markers.
- Deep navy: Primary text, serious surfaces, chat header.
- Saffron: Primary CTA, important action highlights, transformation particles.
- India green: Success states, progress markers, safe completion.
- Paper white: Main background.
- Mist: Secondary panels and page bands.
- Alert red: Emergency warnings only.

Avoid:

- Full-page tricolor stripes.
- Overusing saffron on large backgrounds.
- Making all cards blue.
- Decorative gradients that reduce readability.

## 5. Typography

Recommended font stack:

```css
font-family: Inter, "Noto Sans Devanagari", system-ui, sans-serif;
```

Use `Noto Sans Devanagari` for Hindi text.

Suggested scale:

```css
--text-xs: 12px;
--text-sm: 14px;
--text-md: 16px;
--text-lg: 18px;
--text-xl: 24px;
--text-2xl: 32px;
--text-hero: 48px;
```

Guidelines:

- Use clear sentence case for most labels.
- Avoid long all-caps government-style labels.
- Keep chat text comfortable at 15px to 16px.
- Do not make compact panels use hero-size typography.

## 6. Layout System

Spacing tokens:

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
--space-12: 48px;
--space-16: 64px;
```

Radius tokens:

```css
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 14px;
--radius-pill: 999px;
```

Use 8px radius or less for standard cards. Use larger radius only for chat bubbles and pill CTAs.

## 7. Buttons

### Primary Button

Use for the main action.

```text
Start a Report
Submit demo complaint
```

Style:

- Saffron background.
- Deep navy or white text depending on contrast.
- Clear hover and focus state.

### Secondary Button

Use for lower-priority actions.

```text
Track Complaint
Preview Complaint
```

Style:

- White or mist background.
- Chakra blue border.
- Chakra blue text.

### Emergency Pill

Persistent CTA below chatbox:

```text
Call 1930 now
```

Style:

- Alert red or saffron accent.
- Phone icon.
- Pill shape.
- Always visible in chat interface.
- Also appears when financial fraud is detected.

UX note:

The pill exists because urgent financial fraud should not be trapped inside the AI flow.

## 8. Chat UI

The chat interface should resemble modern AI assistants such as Claude or ChatGPT:

- Centered chat column.
- Calm background.
- Assistant messages on neutral surfaces.
- User messages aligned visually but not overly colorful.
- Composer fixed at bottom.
- Suggested reply chips above or inside the composer area.
- Right-side or collapsible complaint summary panel on desktop.
- Bottom sheet summary on mobile.

### Assistant Avatar

Use a simple Chakra-inspired circular mark:

- Blue circle.
- Thin saffron and green ring.
- Optional shield symbol inside.

### Chat Composer

Elements:

- Textarea.
- Attachment icon.
- Send icon button.
- Microcopy placeholder.
- Emergency pill below.

Placeholder examples:

```text
Tell Rakshak AI what happened...
```

Hindi:

```text
बताइए क्या हुआ...
```

## 9. Cards and Panels

Use cards only where they represent a contained object:

- Complaint summary.
- Category suggestion.
- Evidence file.
- Acknowledgement receipt.

Card style:

- White surface.
- 1px soft border.
- 8px radius.
- Minimal shadow.

Avoid nesting cards inside cards.

## 10. Icons

Use familiar icon categories:

- Phone for `Call 1930 now`.
- Shield for trust and protection.
- Upload for evidence.
- CheckCircle for completion.
- AlertTriangle for emergency guidance.
- Languages for language toggle.
- Send for chat submission.
- FileText for complaint preview.

If using React, lucide icons are recommended.

## 11. Motion

Motion should support the story:

- Old portal screenshot dissolves into particles.
- Tricolor particles swirl into the Cyber Rakshak homepage.
- Chat messages appear softly.
- Complaint summary updates with subtle highlights.
- Evidence upload uses quick progress animation.

Motion constraints:

- Keep homepage transformation under 4 seconds during demo.
- Add reduced-motion fallback.
- Avoid endless decorative animation in the chat screen.

## 12. Accessibility

- Minimum contrast ratio of 4.5:1 for normal text.
- Visible keyboard focus states.
- Hindi text must use readable font and size.
- Emergency CTA should be reachable by keyboard.
- Do not rely on color alone to show category or urgency.
- Provide reduced-motion mode.
- Use plain-language prompts.

## 13. Voice and Tone

Cyber Rakshak should sound:

- Calm
- Respectful
- Direct
- Non-judgmental
- Official but not bureaucratic

Good:

```text
This may be financial fraud. If money was recently deducted, call 1930 now. I will help prepare your report too.
```

Avoid:

```text
Please select the accurate mandatory sub-category as per portal guidelines.
```

## 14. Demo Labels

Because this is a hackathon prototype, include small labels where needed:

```text
Demo prototype
No real complaint will be submitted
Dummy OTP: 123456
```

These labels should be visible but not visually dominant.

