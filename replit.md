# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### Let's Snooze Landing Page (Web)
- **Path**: `artifacts/landing/`
- **Type**: React + Vite
- **Preview path**: `/landing/`
- **Purpose**: Marketing landing page for the Let's Snooze app
- **Design**: Matches app palette — peach, lavender, rosewood; Quicksand font
- **CTA**: "Open App" links to `/` (the Expo app)

### Let's Snooze (Mobile App)
- **Path**: `artifacts/lets-snooze/`
- **Type**: Expo (React Native)
- **Purpose**: Sleep wellness app for high-pressure professionals struggling with bedtime scrolling
- **Design**: Friendly/soft aesthetic — sunset peach, lavender, sage palette; Quicksand font; rounded corners
- **Persistence**: AsyncStorage (frontend-only, no backend)

#### Screens
1. **My Sleep Log** (`app/(tabs)/index.tsx` → `sleep-log.tsx`) — log sleep/wake times, view history, stats
2. **My Sleep Window** (`app/(tabs)/sleep-window.tsx`) — manage digital curfew, app restrictions, bedtime target
3. **My Sleep Insights** (`app/(tabs)/sleep-insights.tsx`) — streak, readiness trend, morning pulse check
4. **Settings** (`app/(tabs)/settings.tsx`) — schedule, notifications, about

#### Key Files
- `context/AppContext.tsx` — all app state: sleep entries, alertness scores, curfew settings, streak calculation
- `components/MorningPulse.tsx` — morning alertness modal (shown once per day on first launch)
- `constants/colors.ts` — design tokens (peach/lavender/sage palette)
- `hooks/useColors.ts` — returns design tokens for current color scheme
