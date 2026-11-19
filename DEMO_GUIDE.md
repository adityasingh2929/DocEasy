# DocEasy presentation guide

## Before the external review

1. Open https://doceasy-zzh2.onrender.com/health and wait for `status: ok` and `accounts: ready`. The free backend can take time to wake up.
2. Open https://doc-easy-alpha.vercel.app and sign in to your own presenter account. Use a second account only if demonstrating isolation. Never present real passwords or cloud environment settings.
3. Run one tutor question and one document quiz to verify the provider's current quota. Keep the included `backend/tests/fixtures/document-study-sample.txt` or another small, non-sensitive text file available.
4. Keep a completed lesson ready for revisiting. For a clean first-time walkthrough, create a separate account; do not erase your own progress.
5. Confirm the browser is at normal zoom. Close unrelated tabs and notifications before screen sharing.

## A coherent 8–10 minute walkthrough

### 1. The problem and entry point (one minute)

Show the home page. Say: “Official documentation is accurate but can be difficult to learn from in sequence. DocEasy turns it into a structured cycle of reading, assessment, code reasoning, and revision.”

Show the two course cards and their lesson counts. Sign in or create a new account. Explain that every learner has separate progress.

### 2. Follow one lesson from start to finish (three minutes)

Choose Python, then Python Values and Names. Point to the explanation, executable example, and official documentation reference. Read the concept and choose **Mark as Complete**.

Start the five-question assessment. Answer four correctly and deliberately miss one to demonstrate feedback. Submit: 4/5 is the 80% pass threshold. Explain that failed attempts can be reviewed and retaken; a failed assessment does not unlock the challenge.

Continue to the challenge. Explain that this is an output-prediction exercise: the platform is assessing code reasoning, not running arbitrary uploaded programs. For the first Python challenge, the expected lines are `Ada 9`, `3`, and `int`. Use a hint, submit the output, and choose **Complete lesson**.

Return to the roadmap. Show that lesson one is complete and lesson two is now available. Refresh to demonstrate persistence.

### 3. Close the feedback loop (one minute)

Open **Mistakes**. Show the deliberately wrong answer, review its explanation, and retry it correctly. Show **Overview**: completion, assessment accuracy, solved challenges, and remaining mistakes. Accuracy includes retakes.

### 4. Demonstrate contextual tutoring (one minute)

Revisit a lesson and choose **Ask Tutor**. Ask a focused question such as “Why does integer floor division differ from ordinary division?” Start with a small hint, then request a stronger hint or explanation. Explain that the tutor receives the selected lesson and exercise context. Answers are AI-generated and should be checked against references.

### 5. Study your own documents (two minutes)

Open **Documents** and upload the small prepared text file. Expand the extracted passages. Show where the text came from before generating anything.

Consent to sending selected passages, then generate a quiz. Answer it and show the supporting passages. Generate a written challenge if time permits; explain that its rubric is a self-assessment checklist. Save to the device library if you want to revisit it. Uploaded documents are not permanent cloud storage.

### 6. Finish with a visible outcome (one minute)

Return to **Overview**. State what the learner accomplished: studied a concept, passed an assessment, solved a challenge, corrected a mistake, and practised from a document. Sign out and sign back in to demonstrate restored account progress.

## Explain the implementation pathway

1. Define the learner journey and completion rules.
2. Build and review the curriculum and exercise bank.
3. Implement the React learning interface and navigation.
4. Add FastAPI services for assessments, retrieval, AI tutoring, and document processing.
5. Add persistent accounts and progress in PostgreSQL.
6. Test grading, user isolation, content outputs, extraction, error handling, and the browser journey.
7. Deploy the frontend to Vercel and the API to Render; verify the live database and provider.

Request flow: React → FastAPI → authored content / PostgreSQL / retrieval + Groq → validated response → learner feedback. The API validates generated exercise structure before returning it. Document output includes references to the extracted source passages.

## Questions you can answer accurately

- **What makes it different from a chatbot?** A fixed curriculum, explicit completion rules, scored assessments, a mistake notebook, personal progress, and source references.
- **What is the retrieval technique?** Topic filtering and keyword ranking over documentation, plus authored lesson context for expanded topics. It is not a vector database.
- **Where is progress stored?** In the learner's PostgreSQL record, with a per-user local cache and retryable synchronization.
- **How are passwords stored?** Salted scrypt hashes. Raw passwords and session tokens are not stored in the database.
- **Does it execute learner code?** No. Course challenges compare predicted output with authored answers; the test suite runs the authored examples to verify them.
- **Does AI grade everything?** No. The core course uses deterministic authored answers. Document written challenges use a transparent self-assessment rubric.
- **What are the boundaries?** Free hosting cold starts, provider quotas, no OCR for scanned PDFs, temporary document sessions, and no email password recovery in this prototype.

## If a service is unavailable during the presentation

Use the core authored course and explain the displayed status honestly. Do not repeatedly submit AI requests after a quota message. A local preview is a fallback only when its backend is running and its own account has been tested. Do not claim an offline mock is a successful live AI response.
