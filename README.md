# LIMS Console (Demo)

Standalone Next.js app for the YeastGenomics LIMS console demo — strain registry, pipeline runs, reports, projects, R export, file import, email, and Slack integrations (simulated).

No pitch UI and no “Back to proposal” link. Served at **`/`** and **`/dashboard`** (same app; `/dashboard` exists so the pitch site can proxy that path unchanged).

## Run locally

Default dev port **3001** so it pairs with the pitch site on 3000:

```bash
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) or [http://localhost:3001/dashboard](http://localhost:3001/dashboard).

With the pitch repo, set `LIMS_CONSOLE_URL=http://localhost:3001` in pitch `.env.local` and use [http://localhost:3000/dashboard](http://localhost:3000/dashboard).

## Deploy (Vercel)

Deploy this repo as its own Vercel project. Point the pitch project’s `LIMS_CONSOLE_URL` at this deployment’s origin.

## Scripts

- `npm run dev` — development server (port 3001)
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run lint` — ESLint
