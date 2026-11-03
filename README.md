# DocEasy

A JavaScript learning app with MDN-based lessons, AI-generated quizzes, output-prediction challenges, and a context-aware tutor. React/Vite frontend and FastAPI backend. Progress is saved in the browser; there are no user accounts.

## Run locally

Backend (Python 3.11+), from `backend`:

```powershell
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
Copy-Item .env.example .env
# Set GROQ_API_KEY in .env. Never commit the real key.
.venv\Scripts\python -m uvicorn app.main:app --reload
```

Frontend (Node 22.12+ or 24+), from `frontend`:

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open the URL printed by Vite. Start with Variables, read the concept, answer the quiz, then solve the challenge to unlock the next lesson. Ask Tutor uses the displayed quiz/challenge as context. Refreshing preserves completed progress.

## Deploy existing services

- Render root directory: `backend`; build: `pip install -r requirements.txt`; start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- Render environment: existing `GROQ_API_KEY`; optional `GROQ_MODEL=openai/gpt-oss-20b`. The old Llama model is retired for free/developer accounts.
- Vercel root directory: `frontend`; framework: Vite; build: `npm run build`; output: `dist`.
- Vercel environment: `VITE_API_URL=https://doceasy-zzh2.onrender.com`. Rebuild after changing it. `frontend/vercel.json` handles refreshes and direct links such as `/home`.
- Before presenting, open the backend URL to allow a sleeping Render service to wake up. Try one quiz, challenge, and tutor question before the demo.

## Checks

From `frontend`: `npm run lint`, `npm run build`, and `node --test src/utils/progress.test.mjs`.

From `backend`: `.venv\Scripts\python -m unittest discover -s tests -v`.

Backend tests mock the AI provider, so they need no key and incur no API usage. Actual AI generation still requires a valid Groq key, account quota, and network access.

## Retrieval limitations

The app uses lightweight topic filtering and keyword ranking over the bundled MDN chunks, not semantic vector search. Some old extracted chunks omit code examples. AI answers still need review; documentation context cannot guarantee zero hallucinations.
