# Expanded learning and document study

Implemented locally in `DocEasy-local`. Existing uncommitted track/navigation changes were preserved.

## JavaScript curriculum

17 working JavaScript lessons, 85 reviewed MCQs and 17 output-prediction challenges. The original ten lessons now include deeper explanations and practice prompts. The previously added error-handling roadmap entry now has complete content. Six additional lessons cover operators/equality, control flow, array transformations, destructuring/spread/optional chaining, classes/prototypes and ES modules. New entries follow existing IDs to preserve saved progress. New lessons use reviewed practice; the legacy MDN AI tutor remains limited to its original supported topics.

`expand_curriculum.py` reproduces the additional authored content and synchronizes the frontend/backend banks. Review generated content before changing this script or rerunning it over manual curriculum edits. The pre-existing Python track is outside this change.

## Run locally

From `backend`:

```powershell
uv sync
.venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

From `frontend` (run here so Tailwind resolves its source paths):

```powershell
npm ci
npm run dev -- --host 127.0.0.1 --port 5175
```

Open `http://127.0.0.1:5175/documents`. Configure `GROQ_API_KEY` in `backend/.env` and optionally `GROQ_MODEL`, then restart the backend, to enable live generation. Upload, extraction, preview, saving and deletion do not require a provider key. Do not put keys in frontend variables.

## Document workflow

1. Upload a text-based PDF, DOCX or UTF-8 TXT file.
2. Inspect extracted text and warnings. PDF chunks retain physical page numbers; DOCX uses headings/sections; TXT uses paragraph sections. Images, complex layouts and scanned pages are not interpreted.
3. Choose focus, difficulty, quiz length or challenge type. Consent is required in the screen before sending selected passages to the AI provider.
4. Answer a quiz to receive a browser-computed score against the generated answer key. Comprehension, scenario and key-term challenges use a model response and self-assessment rubric, not an automatic free-text grade.
5. Inspect source excerpts, progressively reveal hints, retry, or save on this device. Saving is explicit: save again to retain new exercises/answers. Saved material is separate from the reviewed JavaScript progress records.
6. Delete to remove the active server session and saved copy. Saved files can be re-uploaded after session expiry; save the new session again if desired.

## API

| Method | Route | Input/output |
|---|---|---|
| POST | `/documents/upload` | Multipart `file`; returns metadata, source chunks and warnings |
| GET | `/documents/{id}` | Metadata and extracted chunks, or 410 after expiry/deletion/restart |
| POST | `/documents/{id}/quiz` | JSON `focus`, `difficulty`, `count` (1â€“10); returns source-linked MCQs |
| POST | `/documents/{id}/challenge` | JSON `focus`, `difficulty`, `challengeType` (`comprehension`, `scenario`, `key-term`); one written exercise |
| DELETE | `/documents/{id}` | Idempotent deletion, 204 |

Limits: 5 MiB upload, 100 PDF pages, 200,000 extracted characters, 300 chunks, 20-second extraction worker timeout, two simultaneous extraction workers, 32 temporary sessions. DOCX expanded archive limit is 20 MiB. Generation retrieves at most eight 1,400-character chunks; it does not guarantee whole-document coverage. A specific focus helps target the relevant passages.

Errors: 413 oversized upload; 415 unsupported or mismatched type; 422 malformed/empty/scanned document or invalid focus; 410 expired/unknown session; 502 invalid generated exercise; 503 provider unavailable or capacity exhausted. Source IDs, answer options, hint count and challenge rubrics are validated before display. Structural validation does not prove the factual correctness of AI answers.

Sessions expire after one hour and are purged on access and every 30 seconds while running. No uploaded original is retained by the server after extraction. Optional IndexedDB records contain the original File, extracted text, latest practice and saved answers until explicit deletion or browser storage clearing. Document IDs are random capability tokens; this prototype has no authenticated account ownership. Use a single backend worker for in-memory sessions. A subprocess timeout is not a complete hostile-file sandbox: production hosting still needs OS memory/resource isolation, authentication, rate limiting and durable storage if required.

OCR is not implemented. A future OCR adapter must preserve page locations, report confidence and remain subject to the same processing/privacy controls. Mixed PDFs show warnings for pages without readable text.

## Verification

Verified: 30 backend tests, 10 frontend logic/content tests, ESLint, production build and desktop/mobile browser smoke checks. The build retains the existing large-bundle advisory. Live Groq testing subsequently passed with the configured local key: a five-question quiz and comprehension, scenario and key-term challenges using the non-sensitive fixture. Source references and deletion were checked. Live testing exposed format failures; quiz/challenge prompts are now separate and invalid generated output is retried once before returning 502. All 12 document regression tests passed after this change.

```powershell
# backend
.venv\Scripts\python -m unittest discover -s tests -v
# frontend
npm run lint
npm run build
node --test src/utils/*.test.mjs
```

The browser smoke script `frontend/scripts/verify-documents.cjs` requires Playwright, a Chrome executable, and local services on ports 8000/5175. It exercises real local upload, extraction preview, IndexedDB save/reload, consent gating, deletion and mobile layout. Its AI responses are deterministic fixtures; no external provider calls are made. Backend tests also mock provider responses and separately validate real PDF/DOCX/TXT extraction. Live verification results for the non-sensitive sample are in the parent workspace at output/verification/live-document-generation.json. These smoke checks do not guarantee correctness for every document.
