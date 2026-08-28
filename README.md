# Cyber Rakshak

A browser-only prototype for a guided cybercrime reporting experience. The current foundation provides React Router routes and placeholder screens; it does not submit data to a government system or use a backend.

## Stack

React, TypeScript, Vite, React Router DOM, Tailwind CSS, Lucide React, Motion, Zustand, React Hook Form, Zod, `@hookform/resolvers`, Vitest, React Testing Library, `@testing-library/user-event`, and Playwright.

## Prerequisites

- Node.js 20.19+ or 22.12+ (required by the current Vite release)
- npm

Install dependencies:

```bash
npm install
```

## Commands

| Purpose | Command |
| --- | --- |
| Run the development server | `npm run dev` |
| Create a production build and run TypeScript checks | `npm run build` |
| Preview the production build | `npm run preview` |
| Run unit and component tests once | `npm test` |
| Run unit tests in watch mode | `npm run test:watch` |
| Run Playwright route smoke tests | `npm run test:e2e` |
| Run Playwright with its UI | `npm run test:e2e:ui` |

Before the first end-to-end run, install the Playwright browser binary:

```bash
npx playwright install chromium
```

## Available routes

- `/` — homepage
- `/login` — demo login
- `/chat` — complaint assistant
- `/preview` — complaint preview
- `/success` — demo acknowledgement
- `/track` — complaint tracking
