
# Cosmic Jellyfish Zoom — Copilot AI Agent Instructions

## [byterover-mcp]
**Important** :
- Always use byterover-retrieve-knowledge tool to get related context before any tasks
- Always use byterover-store-knowledge to store all critical information after successful tasks

---

## 🏗️ Architecture & Data Flow
- **Frontend**: React 18 + TypeScript + Vite (see `src/`)
- **UI**: Tailwind CSS, Shadcn UI, Radix UI, Lucide icons
- **Backend**: Supabase (auth, DB, edge functions, see `supabase/`)
- **Streaming**: Jellyfin integration (env: `VITE_JELLYFIN_URL`)
- **i18n**: react-i18next, dynamic language switching (see `src/lib/i18n.ts`, `src/locales/`)
- **State**: Zustand + TanStack Query
- **Notifications**: Real-time, cross-component (see `src/components/layout/Notifications.tsx`)
- **Admin**: All admin UI in `src/components/admin/`, with strong pattern reuse

## 🧩 Patterns & Conventions
- **Hooks**: All data access and logic via custom hooks in `src/hooks/` (e.g. `useIncidents`, `useAdmins`, `useProfile`)
- **Dynamic imports**: Use React.lazy for code splitting (see Status/Admin pages)
- **i18n**: Always use `useSafeTranslation` for UI text, never hardcode
- **Avatars**: Use Gravatar fallback (`getGravatarURL`) for user/admin avatars
- **Incident model**: Multilingual fields (`title`, `title_en`, `description`, `description_en`)
- **Date formatting**: Use date-fns, always locale-aware (see IncidentHistory, IncidentsTable)
- **Admin/Status pages**: Card-based, visually harmonized, always show author/avatar for incidents
- **Notifications**: Use shared notification logic/components for both admin and user navbars

## ⚡ Developer Workflows
- **Dev server**: `npm run dev` (Vite)
- **Build**: `npm run build` (prod), `npm run build:dev`, `npm run build:analyze`, `npm run build:plesk`, `npm run build:optimized`
- **Lint**: `npm run lint`
- **Cleanup**: `npm run cleanup`
- **Preview**: `npm run preview`
- **Supabase**: All DB/edge function scripts in `supabase/` and `scripts/`
- **Env**: Use `.env.local` for all secrets/URLs

## 🔗 Integrations & External
- **Supabase**: Auth, DB, edge functions (see `supabase/`)
- **Jellyfin**: Streaming backend, user sync (see env/config)
- **TMDB**: Media catalog (API key in env)
- **Edge Functions**: All custom logic in `supabase/functions/`

## 🚩 Project-Specific Gotchas
- **i18n**: All user-facing text and dates must be locale-aware (see IncidentHistory, IncidentsTable)
- **Admin/Status**: Always show incident author with avatar, harmonize card styles
- **Notifications**: Dropdowns must be visually/behaviorally consistent between admin and user
- **Incident editing**: Multilingual support (tabs for fr/en in forms)
- **Supabase**: Some scripts require manual DB migration (see `scripts/`)
- **Dynamic import errors**: Check for casing/path issues if you see module load failures

## 📁 Key Files & Directories
- `src/components/admin/` — All admin UI (IncidentsTable, IncidentManager, IncidentForm, AdminNotifications)
- `src/components/status/` — Public status/uptime UI (IncidentHistory, ServicesStatus)
- `src/hooks/` — All data logic (useIncidents, useAdmins, useProfile, etc.)
- `src/lib/i18n.ts` — i18n setup and merging
- `src/locales/` — All translation files (fr/en)
- `supabase/functions/` — Edge functions (backend logic)
- `scripts/` — DB and utility scripts

---
For any AI agent: Always check for project-specific patterns in the above files before generating or refactoring code. When in doubt, prefer explicit, locale-aware, and visually consistent solutions.