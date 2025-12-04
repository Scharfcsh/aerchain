# SDE Assignment - Voice-Enabled Task Tracker

Voice-driven task parsing with a React frontend and Node + Express backend, using the Web Speech API in the browser and Google Gemini for task extraction.

## 1) Project Setup

### a) Prerequisites
- Node.js: v18+ (recommended v20+)
- Package manager: npm (comes with Node)
- Google Gemini API key: `GEMINI_API_KEY` from Google AI Studio
- Email service (optional): SMTP credentials or an email API provider (e.g., SendGrid)
- OS: Linux/macOS/Windows (dev tested on Linux)

### b) Install steps
Frontend (client):
- Path: `./client`
- Commands:
  - `cd client`
  - `npm install`
  - Configure environment if needed (see “API keys”)
  - `npm run dev`

Backend (server):
- Path: `./server`
- Commands:
  - `cd server`
  - `npm install`
  - Create `.env` with `GEMINI_API_KEY=your_key_here`
  - `npm start`

### c) Configure email sending/receiving
- This project supports email integration conceptually. If you add email features:
  - Add SMTP credentials to `server/.env`:
    - `SMTP_HOST=smtp.example.com`
    - `SMTP_PORT=587`
    - `SMTP_USER=your_user`
    - `SMTP_PASS=your_pass`
    - `EMAIL_FROM=noreply@example.com`
  - Or use an API-based provider (e.g., SendGrid):
    - `SENDGRID_API_KEY=...`
  - Receiving emails typically requires:
    - A webhook endpoint (in the server) provided by your email provider (SendGrid Inbound Parse, Mailgun routes, etc.), or
    - An IMAP/POP3 polling service.
  - Assumption: For this assignment, only sending notifications (optional) may be configured; receiving/parsing emails can be mocked or deferred.

### d) Run locally
- Backend:
  - `cd server && npm start`
  - Server listens on `http://localhost:3000`
- Frontend:
  - `cd client && npm run dev`
  - App listens on `http://localhost:5173` (Vite default) or Next dev port if applicable
- CORS:
  - Backend enables CORS, so the client can call `http://localhost:3000/api/v1/*`

### e) Seed data or initial scripts
- No DB used; tasks are handled in-memory on the client for this assignment.
- Optional seed:
  - You can pre-populate client state with a sample task list in `client/src/mock/tasks.ts` (if you create one).
- Scripts:
  - `client`: `npm run dev`, `npm run build`, `npm run preview`
  - `server`: `npm start`

## 2) Tech Stack

- Frontend: React + TypeScript, Vite, Tailwind/shadcn UI, date-fns
- Backend: Node.js, Express, dotenv, CORS
- AI Provider: Google Gemini via `@google/genai`
- Speech: Browser Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`)
- Email (optional): SMTP or provider (SendGrid/Mailgun) — not enabled by default
- Key libraries:
  - `@google/genai` for model calls
  - `express`, `cors`, `dotenv`
  - `date-fns` for date formatting

## 3) API Documentation

Base URL: `http://localhost:3000/api/v1`

- Health
  - GET `/api/v1`
  - Response: `{ "message": "Speech Recognition API" }`

- Speech
  - GET `/api/v1/speech`
  - Response: `{ "message": "Speech Recognition API" }`

- Parse task from text
  - POST `/api/v1/speech`
  - Request Body (JSON):
    - `{ "text": "Create a report by next Monday with high priority" }`
  - Success Response (200):
    ```
    {
      "title": "Create report",
      "description": "Create the report",
      "dueDate": "2025-12-03T09:00:00.000Z",
      "priority": "high"
    }
    ```
  - Client/validation errors:
    - 400: `{ "error": "Text is required" }`
    - 422: `{ "error": "Parsed title is empty" }`
  - Server/model errors:
    - 500: `{ "error": "GEMINI_API_KEY not configured" }`
    - 502: `{ "error": "Model did not return JSON", "raw": "<model text>" }`
    - 502: `{ "error": "Invalid JSON from model", "raw": "<model text>" }`

Implementation notes:
- Controller: `server/controller/speech.controller.js`
- Router: `server/routes/speech.route.js`
- Server entry: `server/index.js`

## 4) Decisions & Assumptions

- Models:
  - Tasks: `{ id, title, description, status, priority, dueDate }`
  - Priority sort order: low < medium < high
- Flows:
  - Browser captures speech -> text -> sends to `/api/v1/speech` -> Gemini parses JSON -> client displays/edits tasks.
- JSON enforcement:
  - Prompt requests strict JSON (no fences); backend strips fences if present, extracts the first JSON object, validates fields, normalizes date to ISO, and priority to allowed enum.
- Assumptions:
  - Due dates may be inferred; invalid dates are nulled.
  - Priority defaults to `medium` if not clearly specified.
  - Email features are optional and can be added later.
  - No persistent DB; state is in-memory or client-side for the assignment.

## 5) AI Tools Usage

- Tools:
  - GitHub Copilot (primary), optionally ChatGPT/Claude/Cursor for ideation
- Helped with:
  - Boilerplate generation for Express routes/controllers
  - TypeScript typings for Web Speech API
  - Prompt design and JSON parsing guards
  - UI scaffolding and sorting logic
- Prompts/approaches:
  - “Strict JSON only” prompt with examples
  - Defensive parsing: strip code fences, regex match for JSON object, try/catch on `JSON.parse`
- Learnings/changes:
  - Prefer `@google/genai` over deprecated SDKs
  - Add runtime guards and normalized outputs to reduce client-side errors
  - Type narrowing for priority sorting to avoid implicit `any` issues

## Environment Variables

Create `server/.env`:
```
GEMINI_API_KEY=your_google_gemini_key
# Optional email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
```

## Run Commands

- Backend:
  - `cd server && npm install && npm start`
- Frontend:
  - `cd client && npm install && npm run dev`

## Notes

- Browser speech support varies; Chrome supports `webkitSpeechRecognition`.
- If speech is unsupported, client code throws a clear error.
- Ensure CORS is enabled when running client and server on different