"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  LAB_AFFILIATION_LINE,
  LAB_LEAD_EMAIL,
  LAB_LEAD_INITIALS,
  LAB_LEAD_NAME,
  LAB_NOVA_FCT_LINE,
  LAB_TITLE_LINE,
} from "../labIdentity";
import {
  Q30Sparkline,
  ReportPagesStack,
  ReportVolumeBars,
  RunVolumeBars,
  StageTimeStackBar,
  StrainStatusStackBar,
} from "./DashboardCharts";
import { buildLimsVisualizationRScript, buildRCodeFromImportedTextFile } from "./limsRVisualizationExport";
import { dashboardTokens, drawerTokens, strainStatusStyles } from "./dashboardTheme";
import { ImportFilesPanel } from "./ImportFilesPanel";
import { ProjectsWorkspace } from "./ProjectsWorkspace";
import { SendEmailPanel } from "./SendEmailPanel";
import { SlackPanel } from "./SlackPanel";
import { QuickNotifyModal, type NotifyPreset } from "./QuickNotifyModal";

type StrainRow = {
  id: string;
  genotype: string;
  mutations: string;
  phenotype: string;
  lastRun: string;
  status: "complete" | "running" | "qc_hold";
};

type RunRow = {
  id: string;
  started: string;
  stage: string;
  files: number;
  state: "ok" | "active" | "warn";
};

const STRAINS: StrainRow[] = [
  {
    id: "YG-2841",
    genotype: "MATa his3Δ1 leu2Δ0",
    mutations: "ADE2 Y188N",
    phenotype: "Ade auxotroph, red colony",
    lastRun: "2026-04-11 06:42",
    status: "complete",
  },
  {
    id: "YG-2842",
    genotype: "MATα ura3Δ0",
    mutations: "FAS1 splice region",
    phenotype: "Fatty acid sensitivity",
    lastRun: "2026-04-10 19:08",
    status: "complete",
  },
  {
    id: "YG-2845",
    genotype: "S288C background",
    mutations: "CDC28 R149G",
    phenotype: "Temperature-sensitive growth",
    lastRun: "2026-04-09 14:21",
    status: "qc_hold",
  },
  {
    id: "YG-2850",
    genotype: "BY4741 derivative",
    mutations: "HAP1 upstream indel",
    phenotype: "Respiration profile shift",
    lastRun: "2026-04-11 09:15",
    status: "running",
  },
  {
    id: "YG-2852",
    genotype: "MATa/MATα diploid",
    mutations: "TOR1 Q924K",
    phenotype: "Rapamycin partial resistance",
    lastRun: "2026-04-08 11:03",
    status: "complete",
  },
];

const RUNS: RunRow[] = [
  { id: "RUN-20260411-03", started: "09:12", stage: "Alignment (BWA-MEM)", files: 8, state: "active" },
  { id: "RUN-20260411-02", started: "06:40", stage: "Variant calling (GATK)", files: 12, state: "ok" },
  { id: "RUN-20260410-07", started: "19:05", stage: "QC + Trimming", files: 6, state: "warn" },
];

const DEMO_LIMS_OPERATOR = `${LAB_LEAD_NAME} · ${LAB_LEAD_EMAIL}`;

/** Synthetic LIMS fields for the full-record drawer (demo). */
const STRAIN_LIMS_META: Record<
  string,
  {
    recordUuid: string;
    vcfObject: string;
    lineageParent: string;
    operator: string;
    schema: string;
    notes: string;
  }
> = {
  "YG-2841": {
    recordUuid: "a3f2c901-7b11-4c2e-9f01-ade2y188n",
    vcfObject: "s3://yeast-lims/YG-2841/v4/gatk.filtered.vcf.gz",
    lineageParent: "YG-2100 (ADE2 WT)",
    operator: DEMO_LIMS_OPERATOR,
    schema: "strain_registry_v2.3.json",
    notes: "Phenotype confirmed on SC-Ade; imaging QC attached to run RUN-20260411-02.",
  },
  "YG-2842": {
    recordUuid: "b8115d44-2a90-4f8b-b0c1-fas1splice01",
    vcfObject: "s3://yeast-lims/YG-2842/v2/gatk.filtered.vcf.gz",
    lineageParent: "BY4741",
    operator: DEMO_LIMS_OPERATOR,
    schema: "strain_registry_v2.3.json",
    notes: "Splice-region flagged for manual review; no stop gained.",
  },
  "YG-2845": {
    recordUuid: "c09e22aa-5510-4d1f-9a2b-cdc28ts01",
    vcfObject: "s3://yeast-lims/YG-2845/v1/gatk.filtered.vcf.gz",
    lineageParent: "S288C",
    operator: DEMO_LIMS_OPERATOR,
    schema: "strain_registry_v2.3.json",
    notes: "QC hold: temperature curve not monotonic across replicates; awaiting bench repeat.",
  },
  "YG-2850": {
    recordUuid: "d77a10ff-88cc-4e33-8d11-hap1indel01",
    vcfObject: "s3://yeast-lims/YG-2850/v3/gatk.filtered.vcf.gz",
    lineageParent: "BY4741",
    operator: DEMO_LIMS_OPERATOR,
    schema: "strain_registry_v2.3.json",
    notes: "Active alignment on RUN-20260411-03; VCF pointer updates on completion.",
  },
  "YG-2852": {
    recordUuid: "e445aa33-19dd-4b7e-9c44-tor1q924k",
    vcfObject: "s3://yeast-lims/YG-2852/v5/gatk.filtered.vcf.gz",
    lineageParent: "YG-2601 × YG-2602",
    operator: DEMO_LIMS_OPERATOR,
    schema: "strain_registry_v2.3.json",
    notes: "Diploid merge policy: phased blocks stored under child UUID with shared project PRJ-019.",
  },
};

function StrainRecordDrawer({
  strain,
  onClose,
  lightMode,
}: {
  strain: StrainRow;
  onClose: () => void;
  lightMode: boolean;
}) {
  const meta = STRAIN_LIMS_META[strain.id] ?? {
    recordUuid: "–",
    vcfObject: "–",
    lineageParent: "–",
    operator: "–",
    schema: "strain_registry_v2.3.json",
    notes: "No extended metadata for this demo key.",
  };
  const st = strainStatusStyles(lightMode)[strain.status];
  const d = drawerTokens(lightMode);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="strain-doc-title">
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px] border-0 cursor-default"
        aria-label="Close strain record"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg h-full min-h-0 border-l border-white/[.08] bg-[#060a0e] shadow-[-12px_0_48px_rgba(0,0,0,0.5)] flex flex-col animate-[drawerIn_0.22s_ease-out]">
        <style>{`@keyframes drawerIn { from { transform: translateX(12px); opacity: 0.92; } to { transform: translateX(0); opacity: 1; } }`}</style>
        <div className="shrink-0 p-5 border-b border-white/[.06] flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-1">Full LIMS record</p>
            <h2 id="strain-doc-title" className="text-xl font-mono text-white truncate">
              {strain.id}
            </h2>
            <span
              className={`inline-flex mt-2 text-xs font-mono uppercase tracking-wider px-2 py-1 rounded border ${st.className}`}
            >
              {st.label}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg border border-white/[.12] bg-white/[.04] px-3 py-1.5 text-xs font-mono text-zinc-300 hover:bg-white/[.08] hover:text-white transition-colors"
          >
            Esc
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-8">
          <section>
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#39d98a] mb-3">Biology summary</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-zinc-500 text-xs font-mono mb-0.5">Background</dt>
                <dd className="text-zinc-200">{strain.genotype}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 text-xs font-mono mb-0.5">Variant highlight</dt>
                <dd className="text-[#39d98a] font-mono text-xs">{strain.mutations}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 text-xs font-mono mb-0.5">Phenotype</dt>
                <dd className="text-zinc-200">{strain.phenotype}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 text-xs font-mono mb-0.5">Last ingest</dt>
                <dd className="text-zinc-300 font-mono text-xs">{strain.lastRun}</dd>
              </div>
            </dl>
          </section>
          <section>
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#39d98a] mb-3">System identifiers</h3>
            <dl className="space-y-3 text-sm font-mono text-xs break-all">
              <div>
                <dt className="text-zinc-500 mb-0.5">record_uuid</dt>
                <dd className="text-zinc-200">{meta.recordUuid}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 mb-0.5">vcf_object</dt>
                <dd className="text-sky-300/90">{meta.vcfObject}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 mb-0.5">lineage_parent</dt>
                <dd className="text-zinc-200">{meta.lineageParent}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 mb-0.5">schema</dt>
                <dd className="text-zinc-200">{meta.schema}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 mb-0.5">operator</dt>
                <dd className="text-zinc-200">{meta.operator}</dd>
              </div>
            </dl>
          </section>
          <section>
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#39d98a] mb-3">Audit trail (simulated)</h3>
            <ul className="space-y-2 text-xs text-zinc-400 border border-white/[.06] rounded-xl p-4 bg-white/[.02]">
              <li className="flex gap-2">
                <span className="text-zinc-600 font-mono shrink-0">2026-04-01</span>
                <span>Record created from template import.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-zinc-600 font-mono shrink-0">2026-04-06</span>
                <span>VCF checksum verified; FTS index row upserted.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-zinc-600 font-mono shrink-0">{strain.lastRun.slice(0, 10)}</span>
                <span>Latest ingest event; see pipeline bundle for raw artifacts.</span>
              </li>
            </ul>
            <p className="mt-3 text-xs text-zinc-500 leading-relaxed">{meta.notes}</p>
          </section>
        </div>
      </div>
    </div>
  );
}


export function DashboardClient() {
  const [query, setQuery] = useState("");
  const [activeNav, setActiveNav] = useState<
    "strains" | "runs" | "reports" | "projects" | "r_export" | "import_files" | "send_email" | "slack"
  >("strains");
  const [strainDocId, setStrainDocId] = useState<string | null>(null);
  const [rStrainScope, setRStrainScope] = useState<"all" | "filtered">("all");
  const [rCopied, setRCopied] = useState(false);
  const [importedRAppend, setImportedRAppend] = useState<string | null>(null);
  const [editedRScript, setEditedRScript] = useState<string | null>(null);
  const [rPreviewOpen, setRPreviewOpen] = useState(false);
  const rFileInputRef = useRef<HTMLInputElement>(null);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [demoHighContrast, setDemoHighContrast] = useState(false);
  const [demoLightMode, setDemoLightMode] = useState(false);
  const settingsWrapRef = useRef<HTMLDivElement>(null);

  const [notifyPreset, setNotifyPreset] = useState<NotifyPreset | null>(null);
  const openNotify = useCallback((preset: NotifyPreset) => setNotifyPreset(preset), []);
  const closeNotify = useCallback(() => setNotifyPreset(null), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STRAINS;
    return STRAINS.filter(
      (s) =>
        s.id.toLowerCase().includes(q) ||
        s.mutations.toLowerCase().includes(q) ||
        s.phenotype.toLowerCase().includes(q) ||
        s.genotype.toLowerCase().includes(q),
    );
  }, [query]);

  const strainDoc = useMemo(
    () => (strainDocId ? STRAINS.find((s) => s.id === strainDocId) ?? null : null),
    [strainDocId],
  );

  const closeStrainDoc = useCallback(() => setStrainDocId(null), []);

  useEffect(() => {
    try {
      setDemoHighContrast(localStorage.getItem("lims-demo-high-contrast") === "1");
      setDemoLightMode(localStorage.getItem("lims-demo-light-mode") === "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!settingsOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (settingsWrapRef.current && !settingsWrapRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [settingsOpen]);

  const persistToggle = (key: string, value: boolean) => {
    try {
      localStorage.setItem(key, value ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  const rStrains =
    rStrainScope === "filtered"
      ? filtered.length > 0
        ? filtered
        : STRAINS
      : STRAINS;
  const rScript = useMemo(
    () =>
      buildLimsVisualizationRScript({
        strains: rStrains,
        runs: RUNS,
        dataNote:
          rStrainScope === "filtered"
            ? filtered.length > 0
              ? "strain status chart uses current registry search filter; other blocks use full demo snapshot"
              : "search returned no strains; strain status chart uses full demo set"
            : undefined,
      }),
    [rStrains, rStrainScope, filtered],
  );

  const fullRScript = useMemo(
    () => (importedRAppend ? `${rScript}\n\n${importedRAppend}` : rScript),
    [rScript, importedRAppend],
  );

  // Reset manual edits whenever the auto-generated script changes
  useEffect(() => {
    setEditedRScript(null);
  }, [fullRScript]);

  const activeRScript = editedRScript ?? fullRScript;

  const copyRScript = useCallback(() => {
    void navigator.clipboard.writeText(activeRScript).then(() => {
      setRCopied(true);
      window.setTimeout(() => setRCopied(false), 2000);
    });
  }, [activeRScript]);

  const downloadRScript = useCallback(() => {
    const blob = new Blob([activeRScript], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "yeastgenomics_lims_charts.R";
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 100);
  }, [activeRScript]);

  const onImportFileForR = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      setImportedRAppend(buildRCodeFromImportedTextFile(file.name, text));
      input.value = "";
    };
    reader.onerror = () => {
      input.value = "";
    };
    reader.readAsText(file, "UTF-8");
  }, []);

  const th = useMemo(() => dashboardTokens(demoLightMode), [demoLightMode]);
  const strainStatusClass = useMemo(() => strainStatusStyles(demoLightMode), [demoLightMode]);
  const chartSurface = demoLightMode ? ("light" as const) : ("dark" as const);

  return (
    <div className={`${th.shell} ${demoHighContrast ? "contrast-125" : ""}`}>
      {/* Sidebar */}
      <aside className={th.sidebar}>
        <div className={`p-4 ${th.sidebarHeaderBorder} flex items-center gap-2`}>
          <span className="text-[#39d98a] text-lg font-mono font-bold">⬡</span>
          <div className="min-w-0 space-y-0.5">
            <p className={`text-xs font-mono uppercase tracking-widest ${th.sidebarBrandSub} truncate`}>
              LIMS Console
            </p>
            <p className={`text-xs font-semibold ${th.sidebarTitle} leading-snug break-words`}>{LAB_TITLE_LINE}</p>
            <p className={`text-xs font-semibold ${th.sidebarTitle} leading-snug break-words`}>
              {LAB_NOVA_FCT_LINE}
            </p>
            <p
              className={`text-xs ${th.sidebarBrandSub} leading-snug break-words pt-0.5`}
              title={LAB_AFFILIATION_LINE}
            >
              {LAB_LEAD_NAME}
            </p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1 text-sm">
          {(
            [
              { id: "strains" as const, label: "Strain registry", icon: "▣" },
              { id: "runs" as const, label: "Pipeline runs", icon: "◈" },
              { id: "reports" as const, label: "Reports", icon: "◉" },
              { id: "projects" as const, label: "Projects", icon: "◇" },
              { id: "r_export" as const, label: "R visuals", icon: "R" },
              { id: "import_files" as const, label: "Import files", icon: "↑" },
              { id: "send_email" as const, label: "Send email", icon: "✉" },
              { id: "slack" as const, label: "Slack", icon: "#" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveNav(item.id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors ${
                activeNav === item.id ? th.navActive : th.navInactive
              }`}
            >
              <span
                className={`text-xs w-4 text-center ${demoLightMode ? "text-slate-400" : "text-zinc-600"}`}
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className={th.header}>
          <div className="flex items-center gap-3 min-w-0">
            <span className="lg:hidden text-[#39d98a] font-mono font-bold">⬡</span>
            <div>
              <p className={`text-xs font-mono uppercase tracking-widest ${th.headerKicker}`}>
                Reference · S288C
              </p>
              <h1 className={`text-sm font-semibold ${th.headerTitle} truncate`}>
                {activeNav === "strains" && "Strain registry"}
                {activeNav === "runs" && "Pipeline runs"}
                {activeNav === "reports" && "Automated reports"}
                {activeNav === "projects" && "Projects"}
                {activeNav === "r_export" && "R → chart export"}
                {activeNav === "import_files" && "Import files"}
                {activeNav === "send_email" && "Send email"}
                {activeNav === "slack" && "Slack integration"}
              </h1>
            </div>
          </div>
          <div ref={settingsWrapRef} className="flex items-center gap-2 shrink-0 relative">
            <button
              type="button"
              onClick={() => setSettingsOpen((o) => !o)}
              className={`${th.avatarPlate} cursor-pointer outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-[#39d98a]/40 focus-visible:ring-offset-2 ${
                demoLightMode ? "focus-visible:ring-offset-[#eef2f6]" : "focus-visible:ring-offset-[#060a0e]"
              } ${settingsOpen ? th.menuOpenRing : ""}`}
              aria-controls="lims-demo-settings"
              title={`${LAB_LEAD_NAME} · ${LAB_LEAD_EMAIL} — demo settings`}
              aria-label={`${LAB_LEAD_NAME}, ${LAB_LEAD_EMAIL}. Open demo settings.`}
            >
              {LAB_LEAD_INITIALS}
            </button>
            {settingsOpen && (
              <div
                id="lims-demo-settings"
                className={th.settingsMenu}
                role="region"
                aria-label="Demo settings"
              >
                <p className={`text-[10px] font-mono uppercase tracking-widest ${th.settingsMenuTitle} mb-2 px-0.5`}>
                  Demo settings
                </p>
                <div className="space-y-2">
                  <label className={th.settingsRow}>
                    <span>Light lab theme</span>
                    <input
                      type="checkbox"
                      checked={demoLightMode}
                      onChange={(e) => {
                        const v = e.target.checked;
                        setDemoLightMode(v);
                        persistToggle("lims-demo-light-mode", v);
                      }}
                      className={th.settingsCheckbox}
                    />
                  </label>
                  <label className={th.settingsRow}>
                    <span>High contrast</span>
                    <input
                      type="checkbox"
                      checked={demoHighContrast}
                      onChange={(e) => {
                        const v = e.target.checked;
                        setDemoHighContrast(v);
                        persistToggle("lims-demo-high-contrast", v);
                      }}
                      className={th.settingsCheckbox}
                    />
                  </label>
                </div>
                <p className={`mt-2 pt-2 border-t ${th.settingsFoot} text-[10px] leading-relaxed px-0.5`}>
                  Client: {LAB_LEAD_NAME}. Preferences stay in this browser only.
                </p>
              </div>
            )}
          </div>
        </header>

        {/* Mobile nav */}
        <div className={th.mobileNav}>
          {(
            [
              ["strains", "Strains"],
              ["runs", "Runs"],
              ["reports", "Reports"],
              ["projects", "Projects"],
              ["r_export", "R"],
              ["import_files", "Import"],
              ["send_email", "Email"],
              ["slack", "Slack"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveNav(id)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium ${
                activeNav === id ? "bg-[#39d98a]/15 text-[#39d98a]" : th.mobileNavInactive
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {activeNav === "strains" && (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* KPI strip */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {[
                  { label: "Indexed strains", value: "128", delta: "+6 this week" },
                  { label: "Runs (7d)", value: "14", delta: "2 in progress" },
                  { label: "Mean Q30", value: "94.2%", delta: "Across last 10 runs" },
                  { label: "Open QC holds", value: "3", delta: "Awaiting review" },
                ].map((k) => (
                  <div key={k.label} className={th.kpiCard}>
                    <p className={`text-xs font-mono uppercase tracking-widest ${th.kpiLabel} mb-1`}>
                      {k.label}
                    </p>
                    <p className={`text-2xl font-bold ${th.kpiValue} tabular-nums`}>{k.value}</p>
                    <p className={`text-sm ${th.kpiDelta} mt-1`}>{k.delta}</p>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                <StrainStatusStackBar strains={filtered} surface={chartSurface} />
                <Q30Sparkline surface={chartSurface} />
              </div>

              <div className={th.panel}>
                <div className={`p-4 ${th.panelSectionBorder} flex flex-col gap-3`}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                    <div>
                      <p className={`${th.accentLabel} mb-1`}>Search & filter</p>
                      <p className={`text-sm ${th.bodyText}`}>
                        Query by strain ID, mutation, or phenotype notes (simulated).{" "}
                        <span className={th.bodyTextSoft}>Click any row for the full LIMS document.</span>
                      </p>
                    </div>
                    <label className="w-full sm:w-72 shrink-0">
                      <span className="sr-only">Search strains</span>
                      <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g. ADE2, YG-2841, rapamycin…"
                        className={th.input}
                      />
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openNotify({
                        title: "Email PI — strain summary",
                        emailTo: "pi@yeastlab.pt",
                        emailSubject: `Strain registry summary · ${filtered.length} result${filtered.length === 1 ? "" : "s"}`,
                        emailBody: `Hi,\n\nHere is the current strain registry summary (${filtered.length} strain${filtered.length === 1 ? "" : "s"}):\n\n${filtered.map((s) => `• ${s.id} — ${s.mutations} (${s.status})`).join("\n")}\n\nFull records available in the LIMS console.\n\nRegards,\nYeastGenomics Automation`,
                        slackChannel: "genomics-alerts",
                        slackText: `📋 Strain registry: ${filtered.length} strain${filtered.length === 1 ? "" : "s"} · ${filtered.filter((s) => s.status === "qc_hold").length} QC hold${filtered.filter((s) => s.status === "qc_hold").length === 1 ? "" : "s"} · ${filtered.filter((s) => s.status === "running").length} active`,
                      })}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/[.10] bg-white/[.03] px-3 py-1.5 text-xs font-medium text-zinc-400 hover:border-[#39d98a]/30 hover:text-[#39d98a] transition-colors"
                    >
                      <span className="text-[10px]">✉</span> Email PI summary
                    </button>
                    <button
                      type="button"
                      onClick={() => openNotify({
                        title: "Slack — registry digest",
                        emailTo: "pi@yeastlab.pt",
                        emailSubject: `Strain registry digest · ${new Date().toISOString().slice(0, 10)}`,
                        emailBody: `Hi,\n\nAutomated registry digest.\n\n${filtered.map((s) => `• ${s.id} — ${s.mutations} (${s.status})`).join("\n")}\n\nRegards,\nYeastGenomics Automation`,
                        slackChannel: "genomics-alerts",
                        slackText: `📋 Registry digest: ${filtered.length} strain${filtered.length === 1 ? "" : "s"} shown · ${filtered.filter((s) => s.status === "qc_hold").length} QC hold${filtered.filter((s) => s.status === "qc_hold").length === 1 ? "" : "s"} · ${filtered.filter((s) => s.status === "running").length} active pipeline`,
                      })}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/[.10] bg-white/[.03] px-3 py-1.5 text-xs font-medium text-zinc-400 hover:border-[#39d98a]/30 hover:text-[#39d98a] transition-colors"
                    >
                      <span className="text-[10px] font-mono">#</span> Post to Slack
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className={th.tableHead}>
                        <th className="px-4 py-3 font-medium">Strain</th>
                        <th className="px-4 py-3 font-medium hidden md:table-cell">Background</th>
                        <th className="px-4 py-3 font-medium">Variant highlight</th>
                        <th className="px-4 py-3 font-medium hidden lg:table-cell">Phenotype</th>
                        <th className="px-4 py-3 font-medium hidden sm:table-cell">Last ingest</th>
                        <th className="px-4 py-3 font-medium text-right">LIMS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((row) => {
                        const st = strainStatusClass[row.status];
                        return (
                          <tr
                            key={row.id}
                            tabIndex={0}
                            aria-label={`Open full LIMS record for ${row.id}`}
                            onClick={() => setStrainDocId(row.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setStrainDocId(row.id);
                              }
                            }}
                            className="group border-b border-white/[.04] hover:bg-[#39d98a]/[.04] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#39d98a]/35"
                          >
                            <td className="px-4 py-3 font-mono text-white">
                              <span className="inline-flex items-center gap-2">
                                {row.id}
                                <span className="text-xs font-mono text-zinc-600 group-hover:text-[#39d98a]/70 transition-colors max-[480px]:sr-only">
                                  record →
                                </span>
                              </span>
                            </td>
                            <td className="px-4 py-3 text-zinc-400 hidden md:table-cell max-w-[200px] truncate">
                              {row.genotype}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[#39d98a] font-mono text-xs">{row.mutations}</span>
                            </td>
                            <td className="px-4 py-3 text-zinc-400 hidden lg:table-cell max-w-xs truncate">
                              {row.phenotype}
                            </td>
                            <td className="px-4 py-3 text-zinc-500 font-mono text-xs hidden sm:table-cell whitespace-nowrap">
                              {row.lastRun}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="inline-flex items-center gap-2 justify-end flex-wrap">
                                <span
                                  className={`inline-flex text-xs font-mono uppercase tracking-wider px-2 py-1 rounded border ${st.className}`}
                                >
                                  {st.label}
                                </span>
                                {row.status === "qc_hold" && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openNotify({
                                        title: `Notify — QC hold ${row.id}`,
                                        emailTo: "pi@yeastlab.pt",
                                        emailSubject: `QC hold · ${row.id} awaiting review`,
                                        emailBody: `Hi,\n\nStrain ${row.id} (${row.mutations}) has been placed on QC hold.\n\nBackground: ${row.genotype}\nPhenotype: ${row.phenotype}\nLast ingest: ${row.lastRun}\n\nPlease review in the LIMS console.\n\nRegards,\nYeastGenomics Automation`,
                                        slackChannel: "qc-review",
                                        slackText: `⚠️ QC hold: ${row.id} — ${row.mutations}. ${row.phenotype}. Manual review required.`,
                                      });
                                    }}
                                    className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/8 px-2 py-0.5 text-[10px] font-mono text-amber-400 hover:bg-amber-500/15 transition-colors"
                                  >
                                    Notify
                                  </button>
                                )}
                                {row.status === "complete" && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openNotify({
                                        title: `Share record — ${row.id}`,
                                        emailTo: "pi@yeastlab.pt",
                                        emailSubject: `Strain record · ${row.id} indexed`,
                                        emailBody: `Hi,\n\nStrain ${row.id} has been indexed in LIMS.\n\nVariant: ${row.mutations}\nBackground: ${row.genotype}\nPhenotype: ${row.phenotype}\nLast ingest: ${row.lastRun}\n\nFull LIMS record available in the console.\n\nRegards,\nYeastGenomics Automation`,
                                        slackChannel: "genomics-alerts",
                                        slackText: `✅ Strain ${row.id} indexed — ${row.mutations} · ${row.phenotype}`,
                                      });
                                    }}
                                    className="inline-flex items-center gap-1 rounded border border-white/[.10] bg-white/[.02] px-2 py-0.5 text-[10px] font-mono text-zinc-500 hover:border-[#39d98a]/30 hover:text-[#39d98a] transition-colors"
                                  >
                                    Share
                                  </button>
                                )}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {filtered.length === 0 && (
                  <p className={`p-8 text-center text-sm ${th.bodyTextSoft}`}>No strains match that query.</p>
                )}
              </div>

              <p className={`text-xs ${th.footNote} font-mono text-center`}>
                Simulated data for pitch preview; not connected to live sequencing infrastructure.
              </p>
            </div>
          )}

          {activeNav === "runs" && (
            <div className="max-w-5xl mx-auto space-y-4">
              <p className={`text-sm ${th.bodyText}`}>
                Live-style run monitor. In production this streams Snakemake / Nextflow events from
                the workstation.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <RunVolumeBars runs={RUNS} surface={chartSurface} />
                <StageTimeStackBar surface={chartSurface} />
              </div>
              <ul className="space-y-2">
                {RUNS.map((r) => (
                  <li key={r.id} className={th.runsCard}>
                    <div>
                      <p className={`font-mono text-sm ${th.runsTitle}`}>{r.id}</p>
                      <p className={`text-xs ${th.runsMeta} mt-1`}>
                        Started {r.started} · {r.files} FASTQ pairs
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <span
                        className={`text-xs font-mono uppercase px-2 py-0.5 rounded border ${
                          r.state === "ok"
                            ? "border-[#39d98a]/30 text-[#39d98a]"
                            : r.state === "active"
                              ? "border-sky-500/30 text-sky-300"
                              : "border-amber-500/30 text-amber-300"
                        }`}
                      >
                        {r.state === "ok" ? "Done" : r.state === "active" ? "Active" : "Review"}
                      </span>
                      <span className={`text-xs ${th.runsStage}`}>{r.stage}</span>
                      {r.state === "ok" && (
                        <button
                          type="button"
                          onClick={() => openNotify({
                            title: `Email report — ${r.id}`,
                            emailTo: "pi@yeastlab.pt",
                            emailSubject: `Run ${r.id} · variant report ready`,
                            emailBody: `Hi,\n\nRun ${r.id} has completed successfully.\n\nStage: ${r.stage}\nFiles processed: ${r.files} FASTQ pairs\nStarted: ${r.started}\n\nThe full variant report is available in the LIMS console.\n\nRegards,\nYeastGenomics Automation`,
                            slackChannel: "genomics-alerts",
                            slackText: `✅ Run ${r.id} complete — ${r.files} FASTQ pairs · ${r.stage} done. Report in LIMS.`,
                          })}
                          className="inline-flex items-center gap-1 rounded border border-[#39d98a]/25 bg-[#39d98a]/8 px-2 py-0.5 text-[10px] font-mono text-[#39d98a] hover:bg-[#39d98a]/15 transition-colors"
                        >
                          <span>✉</span> Email report
                        </button>
                      )}
                      {r.state === "warn" && (
                        <button
                          type="button"
                          onClick={() => openNotify({
                            title: `QC alert — ${r.id}`,
                            emailTo: "pi@yeastlab.pt",
                            emailSubject: `QC review required · ${r.id}`,
                            emailBody: `Hi,\n\nRun ${r.id} requires manual QC review.\n\nStage: ${r.stage}\nFiles: ${r.files} FASTQ pairs\nStarted: ${r.started}\n\nPlease review the run in the LIMS console.\n\nRegards,\nYeastGenomics Automation`,
                            slackChannel: "qc-review",
                            slackText: `⚠️ Run ${r.id} needs QC review — ${r.stage}. ${r.files} FASTQ pairs. Started ${r.started}.`,
                          })}
                          className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/8 px-2 py-0.5 text-[10px] font-mono text-amber-400 hover:bg-amber-500/15 transition-colors"
                        >
                          <span className="font-mono text-[10px]">#</span> Slack alert
                        </button>
                      )}
                      {r.state === "active" && (
                        <button
                          type="button"
                          onClick={() => openNotify({
                            title: `Progress update — ${r.id}`,
                            emailTo: "pi@yeastlab.pt",
                            emailSubject: `Run ${r.id} · pipeline active`,
                            emailBody: `Hi,\n\nRun ${r.id} is currently in progress.\n\nCurrent stage: ${r.stage}\nFiles: ${r.files} FASTQ pairs\nStarted: ${r.started}\n\nRegards,\nYeastGenomics Automation`,
                            slackChannel: "genomics-alerts",
                            slackText: `🔄 Run ${r.id} active — ${r.stage} · ${r.files} FASTQ pairs · started ${r.started}`,
                          })}
                          className="inline-flex items-center gap-1 rounded border border-sky-500/25 bg-sky-500/8 px-2 py-0.5 text-[10px] font-mono text-sky-400 hover:bg-sky-500/15 transition-colors"
                        >
                          <span className="font-mono text-[10px]">#</span> Post update
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeNav === "reports" && (
            <div className="max-w-5xl mx-auto space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <p className={`text-sm ${th.bodyText}`}>
                  Per-run PDFs land here automatically after variant calling completes.
                </p>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openNotify({
                      title: "Email latest reports",
                      emailTo: "pi@yeastlab.pt",
                      emailSubject: "Automated reports bundle · YeastGenomics LIMS",
                      emailBody: `Hi,\n\nThe latest variant reports from the YeastGenomics pipeline are now available.\n\n• RUN-20260411-02 · 12 FASTQ pairs · Variant calling complete\n• RUN-20260410-07 · 6 FASTQ pairs · QC review required\n\nFull reports with QC metrics, variant summaries, and depth-of-coverage plots are attached.\n\nRegards,\nYeastGenomics Automation`,
                      slackChannel: "genomics-alerts",
                      slackText: "📄 New variant reports ready: RUN-20260411-02 (12 pairs, done) · RUN-20260410-07 (6 pairs, QC review). Full reports in LIMS.",
                    })}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/[.10] bg-white/[.03] px-3 py-1.5 text-xs font-medium text-zinc-400 hover:border-[#39d98a]/30 hover:text-[#39d98a] transition-colors"
                  >
                    <span className="text-[10px]">✉</span> Email reports
                  </button>
                  <button
                    type="button"
                    onClick={() => openNotify({
                      title: "Post reports to Slack",
                      emailTo: "pi@yeastlab.pt",
                      emailSubject: "Report digest · YeastGenomics LIMS",
                      emailBody: `Hi,\n\nReport digest attached.\n\nRegards,\nYeastGenomics Automation`,
                      slackChannel: "genomics-alerts",
                      slackText: "📄 Reports digest: 2 new reports available in LIMS. RUN-20260411-02 complete · RUN-20260410-07 needs QC review.",
                    })}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/[.10] bg-white/[.03] px-3 py-1.5 text-xs font-medium text-zinc-400 hover:border-[#39d98a]/30 hover:text-[#39d98a] transition-colors"
                  >
                    <span className="text-[10px] font-mono">#</span> Post to Slack
                  </button>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <ReportVolumeBars surface={chartSurface} />
                <ReportPagesStack surface={chartSurface} />
              </div>
              <div className={th.dashedCard}>
                <p className={`${th.bodyTextSoft} text-sm mb-4`}>No report selected</p>
                <button
                  type="button"
                  className={th.ghostBtn}
                  disabled
                >
                  Open sample PDF (demo)
                </button>
              </div>
            </div>
          )}

          {activeNav === "projects" && <ProjectsWorkspace lightMode={demoLightMode} />}

          {activeNav === "r_export" && (
            <div className="max-w-4xl mx-auto space-y-5">
              <div>
                <p className={`text-sm ${th.bodyText} leading-relaxed`}>
                  Export a single R script that mirrors the dashboard demo charts with{" "}
                  <span className={demoLightMode ? "text-slate-800" : "text-zinc-300"}>ggplot2</span>. Running it
                  writes six PNGs into{" "}
                  <code className="text-sm font-mono text-[#39d98a]/90">lims_r_export/</code>{" "}
                  next to the script, useful for slides, methods figures, or offline QC packs.
                </p>
                <p className={`text-xs ${th.footNote} mt-2 font-mono`}>
                  Requires R 4.0+ and ggplot2: install.packages(&quot;ggplot2&quot;)
                </p>
                <p className={`text-xs ${th.footNote} mt-2 leading-relaxed`}>
                  <strong className={demoLightMode ? "text-slate-700" : "text-zinc-400"}>Import file → R:</strong>{" "}
                  pick any file; its UTF-8 text is turned into R that calls{" "}
                  <code className="text-sm font-mono text-[#39d98a]/90">writeLines()</code> to recreate it beside
                  your working directory. Large files are truncated with a comment in the generated block.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className={`text-xs font-mono uppercase tracking-widest ${th.kpiLabel}`}>
                  Strain chart data
                </span>
                <div className={th.pillToggleWrap}>
                  <button
                    type="button"
                    onClick={() => setRStrainScope("all")}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      rStrainScope === "all"
                        ? "bg-[#39d98a]/15 text-[#39d98a]"
                        : th.pillInactive
                    }`}
                  >
                    Full demo set
                  </button>
                  <button
                    type="button"
                    onClick={() => setRStrainScope("filtered")}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      rStrainScope === "filtered"
                        ? "bg-[#39d98a]/15 text-[#39d98a]"
                        : th.pillInactive
                    }`}
                  >
                    Current search filter
                  </button>
                </div>
                <span className={`text-xs ${th.footNote}`}>
                  {rStrains.length} strain{rStrains.length === 1 ? "" : "s"} in status mix
                </span>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <button
                  type="button"
                  onClick={copyRScript}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#39d98a]/35 bg-[#39d98a]/10 px-4 py-2 text-xs font-semibold text-[#39d98a] hover:bg-[#39d98a]/15 transition-colors"
                >
                  {rCopied ? "Copied" : "Copy R script"}
                </button>
                <button type="button" onClick={downloadRScript} className={th.secondaryBtn}>
                  Download yeastgenomics_lims_charts.R
                </button>
                <button
                  type="button"
                  onClick={() => openNotify({
                    title: "Email R script",
                    emailTo: "pi@yeastlab.pt",
                    emailSubject: "R visualisation script · YeastGenomics LIMS charts",
                    emailBody: `Hi,\n\nAttached is the R visualisation script generated from the LIMS console (yeastgenomics_lims_charts.R).\n\nRunning it produces 6 PNG charts into lims_r_export/ beside the script. Requires R 4.0+ and ggplot2.\n\nStrain scope: ${rStrainScope === "all" ? "full demo set" : "current search filter"} · ${rStrains.length} strain${rStrains.length === 1 ? "" : "s"}.\n\nRegards,\nYeastGenomics Automation`,
                    slackChannel: "lab-general",
                    slackText: `📊 R visualisation script ready for ${rStrains.length} strain${rStrains.length === 1 ? "" : "s"} (${rStrainScope === "all" ? "full set" : "filtered"}). Download yeastgenomics_lims_charts.R from LIMS.`,
                  })}
                  className={th.secondaryBtn}
                >
                  <span className="text-[10px]">✉</span> Email script
                </button>
                <button
                  type="button"
                  onClick={() => setRPreviewOpen((o) => !o)}
                  className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-medium transition-colors ${
                    rPreviewOpen
                      ? "border-[#39d98a]/40 bg-[#39d98a]/10 text-[#39d98a]"
                      : th.secondaryBtn
                  }`}
                >
                  {rPreviewOpen ? "Hide chart preview" : "Show chart preview"}
                </button>
                <input
                  id="r-import-file-input"
                  ref={rFileInputRef}
                  type="file"
                  className="hidden"
                  aria-label="Select a file to convert into R writeLines code"
                  onChange={onImportFileForR}
                />
                <button
                  type="button"
                  onClick={() => rFileInputRef.current?.click()}
                  className={th.secondaryBtn}
                >
                  Import file → R code
                </button>
                {importedRAppend ? (
                  <button
                    type="button"
                    onClick={() => setImportedRAppend(null)}
                    className={th.secondaryBtn}
                  >
                    Clear import
                  </button>
                ) : null}
                {editedRScript !== null && (
                  <button
                    type="button"
                    onClick={() => setEditedRScript(null)}
                    className={th.secondaryBtn}
                  >
                    Reset to generated
                  </button>
                )}
              </div>

              {rPreviewOpen && (
                <div className="space-y-3">
                  <p className={`text-xs font-mono uppercase tracking-widest ${th.kpiLabel}`}>
                    Chart preview (mirrors ggplot2 output)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    <StrainStatusStackBar strains={rStrains} surface={chartSurface} />
                    <Q30Sparkline surface={chartSurface} />
                    <RunVolumeBars runs={RUNS} surface={chartSurface} />
                    <StageTimeStackBar surface={chartSurface} />
                    <ReportVolumeBars surface={chartSurface} />
                    <ReportPagesStack surface={chartSurface} />
                  </div>
                  <p className={`text-xs font-mono ${th.footNote}`}>
                    These are the exact same components rendered in the dashboard, identical to what the R script produces as PNGs.
                  </p>
                </div>
              )}

              <div className={th.codeBlock}>
                <div className={`px-3 py-2 ${th.codeBlockHead} flex items-center justify-between gap-2`}>
                  <span className={`text-xs font-mono uppercase tracking-widest ${th.kpiLabel}`}>
                    {editedRScript !== null ? "Editor · edited" : "Editor"}
                  </span>
                  <span className={`text-xs font-mono ${th.footNote} truncate`}>
                    {importedRAppend ? "LIMS charts + imported file block" : "source() → 6× PNG"}
                  </span>
                </div>
                <textarea
                  className={`w-full p-4 text-sm leading-relaxed font-mono ${th.codePre} overflow-auto max-h-[min(52vh,520px)] min-h-[240px] whitespace-pre resize-y bg-transparent border-0 outline-none`}
                  value={activeRScript}
                  onChange={(e) => setEditedRScript(e.target.value)}
                  spellCheck={false}
                  autoCorrect="off"
                  autoCapitalize="off"
                  aria-label="R script editor"
                />
              </div>
            </div>
          )}

          {activeNav === "import_files" && <ImportFilesPanel lightMode={demoLightMode} />}

          {activeNav === "send_email" && <SendEmailPanel lightMode={demoLightMode} />}

          {activeNav === "slack" && <SlackPanel lightMode={demoLightMode} />}
        </main>
      </div>

      {strainDoc ? (
        <StrainRecordDrawer strain={strainDoc} onClose={closeStrainDoc} lightMode={demoLightMode} />
      ) : null}

      {notifyPreset ? (
        <QuickNotifyModal preset={notifyPreset} onClose={closeNotify} lightMode={demoLightMode} />
      ) : null}
    </div>
  );
}
