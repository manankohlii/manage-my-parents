# Manage My Parents

Production: https://manage-my-parents.vercel.app/

## Tech stack
- Vite + React 18 + TypeScript
- Tailwind CSS + shadcn/ui (Radix UI)
- TanStack Query (React Query)
- Supabase (Auth, Postgres, Row Level Security)

## Local development
Prereqs: Node.js 18+ and npm

```sh
npm install
npm run dev
```

Environment variables (create `.env.local`):
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Build
```sh
npm run build
npm run preview
```

## Deployment
The app is deployed on Vercel. For a new deployment:
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- SPA routing: add a rewrite to route all paths to `/index.html` (Vercel rewrite)

Live site: https://manage-my-parents.vercel.app/

## Project structure
- `src/` application code
- `src/integrations/supabase/` Supabase client and generated types
- `src/components/ui/` shadcn/ui components
- `public/` static assets (favicon, images)

## Notes
- Supabase Auth URL configuration should include your deployed URL.
- RLS policies are enabled; ensure you sign in to access protected routes.
