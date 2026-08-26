# OfficeOS

Mobile-first business management game: a founder assigns real business tasks to an AI assistant, receives reusable documents, earns XP, and develops a virtual office.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/mobile run dev` — run the Expo mobile app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required for AI: `OPENAI_API_KEY` on the API server only
- Optional AI model: `OPENAI_MODEL` (defaults to `gpt-5.6-luna`)
- Required on a real phone: `EXPO_PUBLIC_API_URL` pointing to the public API server
- Copy `.env.example` to an untracked local environment file; never commit keys

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo 54, React Native 0.81, Expo Router
- API: Express 5
- DB foundation: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- Mobile routes: `artifacts/mobile/app`
- Game state and AI task lifecycle: `artifacts/mobile/contexts/GameContext.tsx`
- Mobile AI client: `artifacts/mobile/services/ai.ts`
- Server AI endpoint: `artifacts/api-server/src/routes/ai.ts`
- Theme tokens: `artifacts/mobile/constants/colors.ts`
- App Store/EAS configuration: `artifacts/mobile/app.json`, `artifacts/mobile/eas.json`

## Architecture decisions

- Keep Expo/React Native for the MVP; do not rewrite in Unity before validating the core loop.
- OpenAI calls are server-side so the API key never ships in the mobile bundle.
- The first public employee is one AI business assistant; other roles remain visible but locked.
- AI task results use Structured Outputs and are saved as in-game documents.
- Local AsyncStorage remains the prototype persistence layer until hosted auth/database work lands.

## Product

The current vertical slice covers onboarding, company and avatar setup, an isometric office, hiring the AI assistant, assigning a real task, receiving a structured result, saving it as a document, and earning XP/virtual funds.

## User preferences

- Portrait, iPhone-first interface.
- MVP plus launch/marketing budget is capped at USD 500.
- The office starts small and expands gradually through native-feeling game progression.
- 1C, Bitrix, amoCRM, warehouse, multiplayer, and autonomous multi-agent work are post-MVP.

## Gotchas

- Without `OPENAI_API_KEY`, `/api/ai/task` intentionally returns HTTP 503; there is no fake AI fallback.
- Native devices cannot call `localhost`; set `EXPO_PUBLIC_API_URL` to a reachable HTTPS API URL.
- Do not expose OpenAI or database service keys through `EXPO_PUBLIC_*` variables.
