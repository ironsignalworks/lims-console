# LIMS Console (Demo)

Standalone Next.js app for the YeastGenomics LIMS console demo - strain registry, pipeline runs, reports, projects, R export, file import, email, and Slack integrations (simulated).

Includes the interactive **Pipeline scenarios** explorer (Mermaid flowcharts, LIMS DB view, run simulation) under **Pipeline scenarios** in the sidebar, or directly at `/pipeline-schema.html`.

**FAQ:** in-app under **FAQ** in the sidebar (content in `app/dashboard/faqContent.ts`). See also [FAQ.md](./FAQ.md).

## Run locally

Default dev port **3001** so it pairs with the pitch site on 3000:

```bash
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) or [http://localhost:3001/dashboard](http://localhost:3001/dashboard).

## Deploy (Vercel)

Deploy this repo as its own Vercel project. Point the pitch project’s `LIMS_CONSOLE_URL` at this deployment’s origin.

## Scripts

- `npm run dev` - development server (port 3001)
- `npm run build` - production build
- `npm run start` - serve production build
- `npm run lint` - ESLint
