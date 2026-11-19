# DocEasy

DocEasy is a documentation-based learning workspace for JavaScript and Python. It includes personal accounts, persistent progress, 28 lessons (17 JavaScript and 11 Python), 140 authored assessment questions, code-output challenges, a mistake notebook, contextual AI tutoring, and document-based practice.

## Public app

Frontend: https://doc-easy-alpha.vercel.app
Backend: https://doceasy-zzh2.onrender.com

Read [DEMO_GUIDE.md](DEMO_GUIDE.md) for the presentation sequence, architecture explanation, and pre-demo checks.

## Local development

Backend, from `backend` (Python 3.11+):

```powershell
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
Copy-Item .env.example .env
.venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Frontend, from `frontend` (Node 22.12+):

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev -- --host 127.0.0.1 --port 5175
```

Set `VITE_API_URL=http://127.0.0.1:8000` locally. Set `GROQ_API_KEY` in the backend environment for AI tutoring and document practice. Authored lessons, assessments, and challenges do not need AI.

## Accounts and storage

Production uses the free Neon PostgreSQL database through `DATABASE_URL` in Render. Local development uses ignored SQLite storage when `DATABASE_URL` is empty. Render deliberately refuses to use temporary SQLite storage for accounts.

Passwords are salted and scrypt-hashed. Session tokens are random, stored hashed on the server, expire after seven days, and are revoked on sign-out. The browser keeps the current token in session storage. Account endpoints derive the owner from the token; they never accept a client-provided owner ID. Failed sign-ins are throttled by normalized email.

Progress is cached under a separate key per user and synchronized to the server. Save failures are visible and retryable; unsynced local progress is retained. The current prototype is intended for one active learning device at a time; concurrent edits across devices are not merged. Closing a tab ends its local session; sign in again to restore cloud progress.

Documents are temporary on the server and expire after an hour. The optional device library is separate for each signed-in user and is explicitly saved by the learner; it does not sync uploaded files to the cloud. AI requests require consent to send selected passages to the provider.

## Verification

```powershell
# frontend
npm run lint
npm run build
node --test src/utils/progress.test.mjs src/utils/learning.test.mjs src/utils/curriculum.test.mjs
# backend
.venv\Scripts\python -m unittest discover -s tests -v
```

Tests cover authentication, user isolation, revocation, assessment grading, malformed provider responses, document extraction, expiry and deletion. Authored JavaScript and Python challenges are executed in their respective test runtimes. Tests mock the AI provider; live provider verification is separate.

## Deployment

The GitHub `main` branch drives the existing Vercel frontend and Render backend. Vercel root is `frontend`, build `npm run build`, output `dist`. Render root is `backend`, build `pip install -r requirements.txt`, start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.

Required Render variables: `DATABASE_URL`, `GROQ_API_KEY`. Optional: `GROQ_MODEL`, `CORS_ORIGINS`. Vercel uses `VITE_API_URL=https://doceasy-zzh2.onrender.com`. Database credentials must never have a `VITE_` prefix or enter the frontend bundle.

`GET /health` verifies account database connectivity. Free hosting can sleep and AI quotas can be exhausted. Warm the service and run the demo checklist before presenting. AI text is generated, not guaranteed correct. Retrieval uses topic/keyword ranking and authored lesson context; this release does not claim semantic vector search, secure examinations, arbitrary code execution, email verification, or email password recovery.
