# Exam Prep AI

An AI-powered exam preparation app. Enter any exam name and state to get an up-to-date summary of exam rules/process, a personalized study guide with flashcards and mnemonics, and a scored mock exam.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/exam-prep run dev` — run the frontend (port 25513)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM (conversations + messages tables from OpenAI integration)
- AI: OpenAI via Replit AI Integrations (`gpt-5.6-terra`, `json_object` mode)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all endpoints)
- `artifacts/exam-prep/src/` — React frontend
- `artifacts/api-server/src/routes/exam/` — Exam API route handlers
  - `info.ts` — POST /api/exam/info (exam overview, rules, process)
  - `study-guide.ts` — POST /api/exam/study-guide (notes, flashcards, mnemonics)
  - `mock-exam.ts` — POST /api/exam/mock-exam + POST /api/exam/mock-exam/submit
- `lib/integrations-openai-ai-server/` — OpenAI SDK wrapper (server)

## Architecture decisions

- All AI generation uses `response_format: { type: "json_object" }` for reliable structured output
- No session persistence needed — results are stored in React state and passed via URL search params
- Mock exam grading is done by the AI in a second OpenAI call with all questions + user answers submitted together
- `gpt-5.6-terra` is used for all endpoints — capable enough for accurate exam knowledge, no voice/image needed

## Product

- Home page: enter exam name + state → triggers AI generation
- Exam Info page: eligibility, format, sections, passing score, registration, state-specific notes
- Study Guide: study plan, topic notes (by importance), interactive flip flashcards, mnemonics
- Mock Exam: timed multiple-choice with progress tracking, submit for AI grading
- Results: score, pass/fail, per-question explanations, study recommendations

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- AI generation takes 10–30 seconds per endpoint — loading states are shown to the user
- The exam/study-guide endpoint can return up to 8192 tokens — don't lower this limit
- `questionCount` in MockExamInput is clamped to 5–50 server-side to prevent runaway costs
