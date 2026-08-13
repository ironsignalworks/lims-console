/** Single source of truth for in-app FAQ (and FAQ.md pointer). */

export type FaqItem = {
  q: string;
  a: string | string[];
};

export type FaqSection = {
  id: string;
  title: string;
  blurb: string;
  items: FaqItem[];
};

export const FAQ_INTRO =
  "A LIMS (Laboratory Information Management System) is software that tracks samples, experiments, results, and related files across a lab-so teams can find records, follow workflows, and keep an audit trail in one place.";

export const FAQ_INTRO_DEMO =
  "This YeastGenomics Lab · NOVA FCT console is a demo of that idea for yeast genomics (and adaptable to other lab environments). Questions below are for lab stakeholders and engineers.";

export const FAQ_SECTIONS: FaqSection[] = [
  {
    id: "everyone",
    title: "For everyone",
    blurb: "Lab leads, PIs, partners, and anyone evaluating the console.",
    items: [
      {
        q: "What is this application?",
        a: [
          "An interactive demo of a laboratory information management experience for yeast genomics: strain records, sequencing pipeline runs, reports, projects, and day-to-day lab communications. It shows how a modern LIMS front-end can feel without connecting to live sequencers, clusters, or production databases.",
          "The same console model can be adapted to many applications and lab environments-different organisms, assays, instruments, or workflows-by enabling the functions each lab needs (registry, pipelines, QC, reporting, notifications, archival, and so on).",
        ],
      },
      {
        q: "Is this production software?",
        a: [
          "No. This is a demo / pitch console with simulated data and simulated integrations.",
          "Records, metrics, and charts are illustrative.",
          "Email and Slack open a demo notify flow; they do not send real messages unless you wire them later.",
          "Pipeline runs and scenario simulations are local UI demos, not jobs on a real HPC cluster.",
          "Treat it as a reference UI and workflow story, not a deployed system of record.",
        ],
      },
      {
        q: "Who is it for?",
        a: [
          "Lab leads / PIs - strain status, QC holds, and reports in one place.",
          "Bench / bioinformatics staff - how runs, stages, and artifacts might be monitored.",
          "IT / digital teams - how a web console can sit in front of pipelines and a LIMS store.",
          "Procurement / partners - a concrete product shape for scope, risk, and delivery talks.",
        ],
      },
      {
        q: "What can I explore in the console?",
        a: [
          "Strain registry - search and open yeast strain records.",
          "Pipeline runs - batch-style runs with status and notify actions.",
          "Pipeline scenarios - ingest → QC → calling → imaging → archival → reporting, including failure paths.",
          "Reports - automated PDF-style narrative and demo charts.",
          "Projects - group work with local demo persistence.",
          "R visuals - export ggplot2-oriented R for offline figures.",
          "Import files - drop files and inspect a simulated analysis bridge.",
          "Send email / Slack - demo lab notification workflows.",
          "FAQ - this help view.",
        ],
      },
      {
        q: "What are Pipeline scenarios?",
        a: [
          "An interactive explorer (also at /pipeline-schema.html) showing how bioinformatics and LIMS steps connect: ingestion, QC & trimming, variant calling, slide analysis, LIMS archival, report generation, plus a searchable LIMS database explorer.",
          "Each scenario supports happy path, quality fail, and system error. Start a simulation to see steps, metrics, and an activity feed - useful for resilience and audit conversations.",
        ],
      },
      {
        q: "Does any real lab data leave the browser?",
        a: "In this demo build, no live lab systems are required. Theme preferences stay in the browser (localStorage). Imported files are handled in the client for the demo; there is no production backend ingest in this repo.",
      },
      {
        q: "Light mode / dark mode?",
        a: "Yes. Open the avatar Demo settings menu in the header. The pipeline explorer (embedded and full-screen) follows the same theme when opened from the console.",
      },
      {
        q: "Why does some copy say “simulated”?",
        a: "To keep expectations honest: metrics, VCF paths, Slack channels, SMTP, and run events are representative. A production build would replace those with authenticated APIs, real object storage, and approved notification services.",
      },
    ],
  },
  {
    id: "enterprise",
    title: "Enterprise & delivery",
    blurb: "Scope, risk, compliance posture, and stakeholder walkthroughs.",
    items: [
      {
        q: "What problem does this console illustrate?",
        a: [
          "Genomics labs juggle strain identity, FASTQ→VCF pipelines, QC holds, PI reports, and searchable archival. This demo shows those concerns in one operator-facing UI with clear status language (Waiting / In progress / Complete / Needs review) instead of raw terminal noise.",
          "Beyond yeast genomics, the pattern is portable: other labs can reuse the same shell and module layout, then adapt or swap modules to match their instruments, data types, and operating procedures.",
        ],
      },
      {
        q: "Can this model fit other labs or applications?",
        a: [
          "Yes. Treat this as a flexible LIMS console template, not a single-purpose product.",
          "Depending on functions needed, a deployment can emphasize sample/strain registry, pipeline monitoring, imaging or phenotype analysis, reporting, project collaboration, file ingest, or notifications-alone or together.",
          "Domain specifics (reference genomes, assay types, QC rules, storage paths, identity providers) are configuration and integration work on top of the same operator experience.",
        ],
      },
      {
        q: "How would this map to a real enterprise rollout?",
        a: [
          "Strain table + drawer → strain / sample registry service + audit log.",
          "Pipeline runs → workflow engine events (e.g. Snakemake / Nextflow / cloud batch).",
          "Pipeline scenarios → documented SOPs, runbooks, and monitored workflows.",
          "LIMS explorer → SQL / search index over object-store metadata.",
          "Email / Slack panels → approved SMTP, Microsoft 365, Slack, or Teams bots.",
          "R export → validated analysis packs / methods figures.",
          "Projects → project IAM, retention, and collaboration rules.",
          "Exact vendors and hosting are decided with institutional IT and compliance.",
        ],
      },
      {
        q: "Is this suitable for regulated / GxP environments as-is?",
        a: "Not as shipped. The demo does not implement validated electronic records, electronic signatures, or full Part 11 / Annex 11 controls. It can support design and training discussions; a regulated deployment needs formal requirements, validation, and infrastructure.",
      },
      {
        q: "What about security and access control?",
        a: "The demo has no login wall and no multi-tenant access control. Production would typically add SSO (institutional IdP), role-based access (PI / technician / bioinformatician / admin), and encrypted transport to backend services.",
      },
      {
        q: "Suggested stakeholder walkthrough?",
        a: [
          "1. Strain registry → open a record → mention QC hold / notify.",
          "2. Pipeline runs → status language and notify.",
          "3. Pipeline scenarios → happy path, then quality fail or system error.",
          "4. LIMS explorer tab → search artifacts / projects.",
          "5. Optional: R export or import files for methods / data handoff.",
          "Keep reminding viewers that data is simulated.",
        ],
      },
    ],
  },
  {
    id: "developers",
    title: "For developers",
    blurb: "Stack, local run, architecture, and extension path.",
    items: [
      {
        q: "What is the tech stack?",
        a: [
          "Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · TypeScript.",
          "Pipeline diagrams: public/pipeline-schema.html (+ .css / scenarios.js / lims-db.js) + Mermaid 11 (CDN).",
          "Charts: custom SVG / React in DashboardCharts.tsx.",
          "Deploy target: Vercel as a standalone project.",
          "No separate API server or database in this demo repo.",
        ],
      },
      {
        q: "How do I run it locally?",
        a: [
          "npm install && npm run dev",
          "Default: http://localhost:3001 (port 3001 so a pitch site can use 3000).",
          "/ and /dashboard serve the same console (proxy compatibility).",
        ],
      },
      {
        q: "EADDRINUSE on port 3001?",
        a: "Another Node/Next process already owns 3001. Stop that process (or the other terminal running npm run dev), then start again.",
      },
      {
        q: "Where does the UI live?",
        a: [
          "app/dashboard/DashboardClient.tsx - main shell and most views.",
          "app/dashboard/PipelineSchemaPanel.tsx - pipeline embed framing.",
          "public/pipeline-schema.html - shell; scenarios.js + lims-db.js + .css hold data/styles.",
          "app/dashboard/ProjectsWorkspace.tsx - projects (browser storage).",
          "app/dashboard/*Panel.tsx - import, email, Slack, FAQ.",
          "app/dashboard/dashboardTheme.ts - light/dark tokens.",
          "app/labIdentity.ts - lab branding placeholders.",
        ],
      },
      {
        q: "How do pipeline scenarios work technically?",
        a: [
          "Scenario graphs are Mermaid flowcharts (happy / qfail / error).",
          "Role styling (:::source, :::warn, :::err, …) is applied with CSS, not runtime classDef color injection.",
          "Simulation advances steps, metrics, and the activity log in the browser.",
          "Embed: /pipeline-schema.html?embed=1&theme=light|dark",
          "Full-screen from the console passes the current theme (localStorage fallback).",
        ],
      },
      {
        q: "Is there a backend?",
        a: "Not in this repository. All demo state is client-side. Production would add APIs for strains, runs, artifacts, auth, and notifications.",
      },
      {
        q: "How do I build for production hosting?",
        a: [
          "npm run build && npm run start - or deploy to Vercel.",
          "If a pitch site proxies the console, set LIMS_CONSOLE_URL to this app’s origin.",
        ],
      },
      {
        q: "Can I extend it toward a real LIMS?",
        a: [
          "Replace hardcoded STRAINS / RUNS with authenticated API calls.",
          "Stream workflow events into the runs view.",
          "Point the LIMS explorer at a real metadata / search service.",
          "Wire email/Slack to approved gateways behind a BFF or server actions.",
          "Add authN/authZ and audit logging.",
          "Keep the information architecture unless product research says otherwise.",
        ],
      },
    ],
  },
];

export const FAQ_SHORT_ANSWERS: { q: string; a: string }[] = [
  { q: "Other lab types?", a: "Yes - adapt modules to the functions each environment needs" },
  { q: "Live sequencing?", a: "No - demo only" },
  { q: "Real email/Slack?", a: "Simulated notify UI" },
  { q: "Real SQL LIMS?", a: "Demo catalog only" },
  { q: "Offline R charts?", a: "Export script + ggplot2 locally" },
  { q: "Mobile?", a: "Responsive layout; pipeline explorer adapts" },
  { q: "Branding?", a: "YeastGenomics Lab · NOVA FCT (labIdentity.ts)" },
];
