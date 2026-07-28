"use client";

/** Embeds the interactive pipeline scenario explorer (static HTML + Mermaid). */
export function PipelineSchemaPanel({ lightMode = true }: { lightMode?: boolean }) {
  const cardClass = lightMode
    ? "rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    : "rounded-xl border border-white/10 bg-[#1a2332] p-4";
  const muted = lightMode ? "text-slate-600" : "text-zinc-400";
  const label = lightMode ? "text-slate-500" : "text-zinc-500";
  const title = lightMode ? "text-slate-900" : "text-zinc-100";
  const frameClass = lightMode
    ? "rounded-xl border border-slate-200 overflow-hidden bg-[#f1f4f8] shadow-sm"
    : "rounded-xl border border-white/10 overflow-hidden bg-[#1a2332]";
  const embedSrc = `/pipeline-schema.html?embed=1&theme=${lightMode ? "light" : "dark"}`;
  const fullScreenSrc = `/pipeline-schema.html?theme=${lightMode ? "light" : "dark"}`;

  return (
    <div className="space-y-5">
      <section className={cardClass}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1.5 min-w-0">
            <p className={`text-xs font-medium tracking-wide ${label}`}>PIPELINE OPERATIONS HUB</p>
            <h2 className={`text-lg font-semibold ${title}`}>Scenario simulator and LIMS data traceability</h2>
            <p className={`text-sm ${muted}`}>
              Demo-grade control surface for stakeholder walkthroughs. Includes six pipeline scenarios,
              failure/recovery simulation, and a searchable LIMS artifact explorer.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 min-w-[220px] lg:max-w-[280px]">
            {[
              { k: "Scenarios", v: "6 + DB" },
              { k: "Coverage", v: "Ingest → Report" },
              { k: "Error drills", v: "Per scenario" },
              { k: "Data mode", v: "Simulated" },
            ].map((item) => (
              <div
                key={item.k}
                className={
                  lightMode
                    ? "rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                    : "rounded-lg border border-white/10 bg-[#111827] px-3 py-2"
                }
              >
                <p className={`text-[10px] font-medium tracking-wide ${label}`}>{item.k}</p>
                <p className={`text-xs font-mono mt-1 ${title}`}>{item.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        <div className={cardClass}>
          <p className={`text-[10px] font-medium tracking-wide ${label}`}>STABILITY SIGNAL</p>
          <p className={`text-sm font-semibold mt-1 ${title}`}>Resilience demonstrations ready</p>
          <p className={`text-xs mt-1 ${muted}`}>
            Each scenario includes happy path, quality warning, and system error tracks to support enterprise
            procurement and risk conversations.
          </p>
        </div>
        <div className={cardClass}>
          <p className={`text-[10px] font-medium tracking-wide ${label}`}>AUDITABILITY</p>
          <p className={`text-sm font-semibold mt-1 ${title}`}>Traceable flow + LIMS index view</p>
          <p className={`text-xs mt-1 ${muted}`}>
            Steps, metrics, and simulated logs are paired with searchable artifact records for clear provenance storytelling.
          </p>
        </div>
        <div className={cardClass}>
          <p className={`text-[10px] font-medium tracking-wide ${label}`}>DEMO SAFETY</p>
          <p className={`text-sm font-semibold mt-1 ${title}`}>No live infrastructure dependencies</p>
          <p className={`text-xs mt-1 ${muted}`}>
            All content is deterministic demo data, so you can present end-to-end workflows without exposing production systems.
          </p>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <a
          href={fullScreenSrc}
          target="_blank"
          rel="noreferrer"
          className={
            lightMode
              ? "inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              : "inline-flex items-center gap-2 rounded-lg border border-white/20 bg-[#1a2332] px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-[#223146] transition-colors"
          }
        >
          Open full-screen explorer
        </a>
        <span className={`text-xs ${muted}`}>
          Tip: use scenario tabs + run simulation + LIMS explorer filter during live demos.
        </span>
      </div>

      <div className={frameClass}>
        <div
          className={
            lightMode
              ? "px-3 py-2 border-b border-slate-200 bg-white"
              : "px-3 py-2 border-b border-white/10 bg-[#222c3a]"
          }
        >
          <p className={`text-xs ${lightMode ? "text-slate-500" : "text-slate-400"}`}>
            Interactive scenario workspace
          </p>
        </div>
        <div className="h-[calc(100dvh-18rem)] min-h-[520px]">
          <iframe
            src={embedSrc}
            title="Pipeline scenarios"
            className={`w-full h-full border-0 ${lightMode ? "bg-[#f1f4f8]" : "bg-[#1a2332]"}`}
          />
        </div>
      </div>
    </div>
  );
}
