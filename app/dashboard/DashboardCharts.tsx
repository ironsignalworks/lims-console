"use client";

import type { DependencyList, ReactNode } from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { DEMO_Q30_SERIES } from "./limsRVisualizationExport";

export type StrainStatus = "complete" | "running" | "qc_hold";

export type StrainForChart = { status: StrainStatus };

export type RunForChart = { id: string; files: number; state: "ok" | "active" | "warn" };

const ACCENT = "#39d98a";

export type ChartSurface = "dark" | "light";

const chartUi = {
  card: (s: ChartSurface) =>
    s === "light"
      ? "rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm transition-[border-color,box-shadow] duration-300 hover:border-slate-300/90 hover:shadow-md"
      : "rounded-xl border border-white/[.07] bg-[#0a1016] p-4 transition-[border-color,box-shadow] duration-300 hover:border-white/[.12] hover:shadow-[0_0_0_1px_rgba(57,217,138,0.08)]",
  sub: (s: ChartSurface) => (s === "light" ? "text-slate-500" : "text-zinc-500"),
  sub9: (s: ChartSurface) => (s === "light" ? "text-slate-600" : "text-zinc-500"),
  metricBox: (s: ChartSurface) =>
    s === "light"
      ? "rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 w-full h-full"
      : "rounded-lg border border-white/[.1] bg-[#060a0e] px-2.5 py-1.5 w-full h-full",
  metricGreen: (s: ChartSurface) =>
    s === "light"
      ? "rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 w-full h-full"
      : "rounded-lg border border-[#39d98a]/25 bg-[#39d98a]/8 px-2.5 py-1.5 w-full h-full",
  metricPdf: (s: ChartSurface) =>
    s === "light"
      ? "rounded-lg border border-emerald-200/80 bg-emerald-50/90 px-2.5 py-1.5 w-full h-full"
      : "rounded-lg border border-[#39d98a]/20 bg-[#39d98a]/6 px-2.5 py-1.5 w-full h-full",
  value: (s: ChartSurface) => (s === "light" ? "text-slate-900" : "text-white"),
  legend: (s: ChartSurface) => (s === "light" ? "text-slate-500" : "text-zinc-400"),
  legendHi: (s: ChartSurface, on: boolean) => (on ? (s === "light" ? "text-slate-900" : "text-zinc-200") : ""),
  legendNum: (s: ChartSurface) => (s === "light" ? "text-slate-700" : "text-zinc-300"),
  barTrack: (s: ChartSurface) =>
    s === "light" ? "h-4 rounded-full bg-slate-200/90 overflow-hidden" : "h-4 rounded-full bg-zinc-800/80 overflow-hidden",
  barLabel: (s: ChartSurface, active: boolean) =>
    `text-xs font-mono truncate w-full text-center transition-colors ${
      active
        ? "text-[#39d98a]"
        : s === "light"
          ? "text-slate-500 group-hover:text-slate-700"
          : "text-zinc-600 group-hover:text-zinc-400"
    }`,
  gridLine: (s: ChartSurface) => (s === "light" ? "rgba(15,23,42,0.09)" : "rgba(255,255,255,0.06)"),
  axis: (s: ChartSurface) => (s === "light" ? "text-slate-500" : "text-zinc-600"),
  /** Vertical cursor on Q30 sparkline */
  sparkCrosshair: (s: ChartSurface) =>
    s === "light" ? "rgba(5,150,105,0.45)" : "rgba(57,217,138,0.35)",
  /** Active point ring: dark mode white halo; light mode slate for contrast on white card */
  sparkDotStroke: (s: ChartSurface, active: boolean) =>
    active ? (s === "light" ? "#0f172a" : "#ffffff") : "none",
  /** Area fill under Q30 line; softer on light cards */
  sparkFillTopOpacity: (s: ChartSurface) => (s === "light" ? "0.2" : "0.35"),
};

/**
 * Reserves width/height from initial paint so hover metrics never reflow the chart
 * (avoids mouseenter/mouseleave thrash when the metric panel pushes content).
 */
function ChartMetricSlot({
  show,
  ghost,
  children,
  className = "",
}: {
  show: boolean;
  ghost: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative shrink-0 ${className}`}>
      <div className="invisible pointer-events-none select-none" aria-hidden>
        {ghost}
      </div>
      <div
        className={`absolute inset-0 flex flex-col items-end text-right transition-opacity duration-150 ${
          show ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function useDrawProgress(deps: DependencyList) {
  const [t, setT] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    let startTime = 0;
    const dur = 880;
    const tick = (now: number) => {
      if (!startTime) startTime = now;
      const p = Math.min(1, (now - startTime) / dur);
      setT(p);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps forwarded from callers
  }, deps);
  return t;
}

/** Horizontal stacked bar; updates when strain list (e.g. search filter) changes. */
export function StrainStatusStackBar({
  strains,
  surface = "dark",
}: {
  strains: StrainForChart[];
  surface?: ChartSurface;
}) {
  const [hoverKey, setHoverKey] = useState<string | null>(null);

  const counts = useMemo(() => {
    let complete = 0;
    let running = 0;
    let qc_hold = 0;
    for (const s of strains) {
      if (s.status === "complete") complete++;
      else if (s.status === "running") running++;
      else qc_hold++;
    }
    return { complete, running, qc_hold };
  }, [strains]);

  const total = counts.complete + counts.running + counts.qc_hold || 1;
  const draw = useDrawProgress([strains]);

  const segs = [
    { key: "complete", n: counts.complete, className: "bg-[#39d98a]/80", label: "Indexed" },
    { key: "running", n: counts.running, className: "bg-sky-400/70", label: "Pipeline" },
    { key: "qc_hold", n: counts.qc_hold, className: "bg-amber-400/70", label: "QC hold" },
  ].filter((s) => s.n > 0);

  const hoverSeg = segs.find((s) => s.key === hoverKey);

  return (
    <div className={chartUi.card(surface)}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-[#39d98a]">
            LIMS status mix
          </p>
          <p className={`text-xs ${chartUi.sub(surface)} mt-0.5`}>
            Reflects the current table filter · {strains.length} strains
          </p>
        </div>
        <ChartMetricSlot
          show={!!hoverSeg}
          className="w-[9.5rem]"
          ghost={
            <div className="rounded-lg border border-transparent px-2.5 py-1.5">
              <p className="text-xs font-mono uppercase tracking-wider">QC hold</p>
              <p className="text-sm font-mono tabular-nums">
                999 <span className={`${chartUi.sub(surface)} text-xs`}>(100%)</span>
              </p>
            </div>
          }
        >
          {hoverSeg ? (
            <div className={chartUi.metricBox(surface)}>
              <p className={`text-xs font-mono uppercase tracking-wider ${chartUi.sub9(surface)}`}>
                {hoverSeg.label}
              </p>
              <p className={`text-sm font-mono ${chartUi.value(surface)} tabular-nums`}>
                {hoverSeg.n}{" "}
                <span className={`${chartUi.sub(surface)} text-xs`}>
                  ({((hoverSeg.n / total) * 100).toFixed(0)}%)
                </span>
              </p>
            </div>
          ) : null}
        </ChartMetricSlot>
      </div>
      <div className={chartUi.barTrack(surface)}>
        <div
          className="flex h-full w-full origin-left"
          style={{ transform: `scaleX(${Math.max(0.04, draw)})` }}
        >
          {segs.length === 0 ? (
            <div className={surface === "light" ? "h-full w-full bg-slate-200/80" : "h-full w-full bg-zinc-700/40"} />
          ) : (
            segs.map((s) => (
              <button
                key={s.key}
                type="button"
                onMouseEnter={() => setHoverKey(s.key)}
                onMouseLeave={() => setHoverKey(null)}
                onFocus={() => setHoverKey(s.key)}
                onBlur={() => setHoverKey(null)}
                className={`relative h-full min-w-[8px] ${s.className} transition-[width,filter] duration-300 ease-out hover:brightness-110 hover:saturate-125 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#39d98a]/60`}
                style={{ width: `${(s.n / total) * 100}%` }}
                aria-label={`${s.label}: ${s.n} strains, ${((s.n / total) * 100).toFixed(0)} percent`}
              />
            ))
          )}
        </div>
      </div>
      <div className={`flex flex-wrap gap-3 mt-3 text-sm ${chartUi.legend(surface)}`}>
        {segs.map((s) => (
          <span
            key={s.key}
            className={`transition-colors ${chartUi.legendHi(surface, hoverKey === s.key)}`}
          >
            <span className={`inline-block w-2 h-2 rounded-sm mr-1.5 align-middle ${s.className} transition-transform ${hoverKey === s.key ? "scale-125" : ""}`} />
            {s.label}{" "}
            <span className={`${chartUi.legendNum(surface)} font-mono tabular-nums`}>{s.n}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Animated area sparkline; mean Q30 trend (demo). */
export function Q30Sparkline({ surface = "dark" }: { surface?: ChartSurface }) {
  const sparkId = useId().replace(/:/g, "");
  const [series, setSeries] = useState<number[]>(() => [...DEMO_Q30_SERIES]);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const draw = useDrawProgress(["q30-sparkline"]);

  useEffect(() => {
    const id = setInterval(() => {
      setSeries((prev) => {
        const tail = prev[prev.length - 1] + (Math.random() - 0.5) * 0.004;
        const next = [...prev.slice(1), tail];
        return next.map((v) => Math.min(0.97, Math.max(0.88, v)));
      });
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const w = 320;
  const h = 88;
  const pad = 8;
  const min = 0.86;
  const max = 0.98;
  const norm = (v: number) => pad + (1 - (v - min) / (max - min)) * (h - pad * 2);
  const step = (w - pad * 2) / (series.length - 1 || 1);
  const points = series.map((v, i) => [pad + i * step, norm(v)] as const);
  const lineD = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const areaD = `${lineD} L${pad + (series.length - 1) * step},${h} L${pad},${h} Z`;
  const clipW = (w - pad * 2) * draw + pad;
  const hi = hoverIdx !== null ? points[hoverIdx] : null;
  const runLabel = (i: number) => `R-${String(series.length - i).padStart(2, "0")}`;

  return (
    <div className={chartUi.card(surface)}>
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-[#39d98a]">Mean Q30 (10 runs)</p>
          <p className={`text-xs ${chartUi.sub(surface)} mt-0.5`}>Synthetic live tail (demo only)</p>
        </div>
        <ChartMetricSlot
          show={hoverIdx !== null}
          className="w-[7.5rem]"
          ghost={
            <div className="rounded-lg border border-transparent px-2.5 py-1.5">
              <p className="text-xs font-mono uppercase tracking-wider">R-10</p>
              <p className="text-sm font-mono tabular-nums">100.00%</p>
              <p className={`text-xs ${chartUi.sub(surface)}`}>vs floor 86%</p>
            </div>
          }
        >
          {hoverIdx !== null ? (
            <div className={chartUi.metricGreen(surface)}>
              <p className="text-xs font-mono uppercase tracking-wider text-[#39d98a]/80">{runLabel(hoverIdx)}</p>
              <p className={`text-sm font-mono ${chartUi.value(surface)} tabular-nums`}>
                {(series[hoverIdx] * 100).toFixed(2)}%
              </p>
              <p className={`text-xs ${chartUi.sub(surface)}`}>vs floor 86%</p>
            </div>
          ) : null}
        </ChartMetricSlot>
      </div>
      <svg
        width="100%"
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="xMidYMid meet"
        className="max-w-full cursor-crosshair touch-none"
        role="img"
        aria-label="Line chart of mean Q30 fraction over recent runs; hover for per-run values"
        onMouseLeave={() => setHoverIdx(null)}
        onMouseMove={(e) => {
          const svg = e.currentTarget;
          const rect = svg.getBoundingClientRect();
          const px = ((e.clientX - rect.left) / rect.width) * w;
          const inner = px - pad;
          const idx = Math.round(inner / step);
          const clamped = Math.max(0, Math.min(series.length - 1, idx));
          setHoverIdx(clamped);
        }}
      >
        <defs>
          <linearGradient id={`q30fill-${sparkId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity={chartUi.sparkFillTopOpacity(surface)} />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </linearGradient>
        </defs>
        <line
          x1={pad}
          y1={norm(0.94)}
          x2={w - pad}
          y2={norm(0.94)}
          stroke={chartUi.gridLine(surface)}
          strokeDasharray="4 4"
        />
        {hi && (
          <line
            x1={hi[0]}
            y1={pad}
            x2={hi[0]}
            y2={h - pad}
            stroke={chartUi.sparkCrosshair(surface)}
            strokeWidth="1"
            className="transition-opacity duration-150"
          />
        )}
        <clipPath id={`q30clip-${sparkId}`}>
          <rect x="0" y="0" width={clipW} height={h} />
        </clipPath>
        <g clipPath={`url(#q30clip-${sparkId})`}>
          <path d={areaD} fill={`url(#q30fill-${sparkId})`} />
          <path
            d={lineD}
            fill="none"
            stroke={ACCENT}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        {points.map(([x, y], i) => {
          const active = hoverIdx === i;
          const r = i === points.length - 1 ? 3.5 : 2.5;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={r}
              fill={ACCENT}
              stroke={chartUi.sparkDotStroke(surface, active)}
              strokeOpacity={0.35}
              strokeWidth={active ? 1.5 : 0}
              opacity={Math.min(1, draw * 1.4) * (active ? 1 : i === points.length - 1 ? 1 : 0.45)}
              className="transition-[opacity,stroke-width] duration-150"
            />
          );
        })}
      </svg>
      <div className={`flex justify-between text-xs font-mono ${chartUi.axis(surface)} mt-1`}>
        <span>older</span>
        <span className="text-[#39d98a] tabular-nums">{(series[series.length - 1] * 100).toFixed(1)}%</span>
        <span>latest</span>
      </div>
    </div>
  );
}

/** Vertical bars; FASTQ pairs per run. */
export function RunVolumeBars({
  runs,
  surface = "dark",
}: {
  runs: RunForChart[];
  surface?: ChartSurface;
}) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const maxF = Math.max(...runs.map((r) => r.files), 1);
  const draw = useDrawProgress([runs.map((r) => r.id).join("|")]);
  const hoverRun = runs.find((r) => r.id === hoverId);

  return (
    <div className={chartUi.card(surface)}>
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-[#39d98a]">FASTQ pairs / run</p>
          <p className={`text-xs ${chartUi.sub(surface)} mt-0.5`}>Relative batch size (demo)</p>
        </div>
        <ChartMetricSlot
          show={!!hoverRun}
          className="w-[10.5rem]"
          ghost={
            <div className="rounded-lg border border-transparent px-2.5 py-1.5 text-right">
              <p className="text-xs font-mono max-w-[10rem] truncate">RUN-20260411-03</p>
              <p className="text-sm font-mono tabular-nums">99 pairs</p>
              <p className={`text-xs ${chartUi.sub(surface)}`}>Needs review</p>
            </div>
          }
        >
          {hoverRun ? (
            <div className={chartUi.metricBox(surface)}>
              <p className={`text-xs font-mono ${chartUi.sub9(surface)} truncate`} title={hoverRun.id}>
                {hoverRun.id}
              </p>
              <p className={`text-sm font-mono ${chartUi.value(surface)} tabular-nums`}>{hoverRun.files} pairs</p>
              <p className={`text-xs ${chartUi.sub(surface)}`}>
                {hoverRun.state === "ok" ? "Completed" : hoverRun.state === "active" ? "In flight" : "Needs review"}
              </p>
            </div>
          ) : null}
        </ChartMetricSlot>
      </div>
      <div className="flex items-end justify-between gap-2" style={{ height: 100 }}>
        {runs.map((r) => {
          const h = (r.files / maxF) * 88 * draw;
          const color =
            r.state === "ok" ? ACCENT : r.state === "active" ? "#38bdf8" : "#fbbf24";
          const active = hoverId === r.id;
          const glow =
            r.state === "active" || active
              ? surface === "light"
                ? `0 0 ${active ? 16 : 12}px ${color}50, 0 3px 10px rgba(15,23,42,0.12)`
                : `0 0 ${active ? 20 : 14}px ${color}55, 0 4px 12px rgba(0,0,0,0.35)`
              : undefined;
          return (
            <button
              key={r.id}
              type="button"
              className="flex-1 flex flex-col items-center gap-1 min-w-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#39d98a]/40 rounded-t"
              onMouseEnter={() => setHoverId(r.id)}
              onMouseLeave={() => setHoverId(null)}
              onFocus={() => setHoverId(r.id)}
              onBlur={() => setHoverId(null)}
              aria-label={`${r.id}, ${r.files} FASTQ pairs, ${r.state}`}
            >
              <div
                className="w-full max-w-[52px] mx-auto rounded-t transition-[filter,box-shadow] duration-300 ease-out"
                style={{
                  height: `${h}px`,
                  background: `linear-gradient(180deg, ${color}cc 0%, ${color}44 100%)`,
                  boxShadow: glow,
                  filter: active ? "brightness(1.12) saturate(1.1)" : undefined,
                }}
              />
              <span
                className={`text-xs font-mono truncate w-full text-center transition-colors ${chartUi.barLabel(surface, active)}`}
              >
                {r.id.replace("RUN-202604", "")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Cluster time share by pipeline stage (stacked). */
export function StageTimeStackBar({ surface = "dark" }: { surface?: ChartSurface }) {
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);
  const draw = useDrawProgress(["stage-stack"]);
  const stages = useMemo(
    () => [
      { label: "QC", pct: 22, className: "bg-amber-400/75", estHrs: "~38 h" },
      { label: "Align", pct: 35, className: "bg-sky-400/75", estHrs: "~61 h" },
      { label: "Call", pct: 28, className: "bg-[#39d98a]/80", estHrs: "~49 h" },
      {
        label: "Other",
        pct: 15,
        className: surface === "light" ? "bg-slate-400/80" : "bg-zinc-500/65",
        estHrs: "~26 h",
      },
    ],
    [surface],
  );
  const hoverStage = stages.find((s) => s.label === hoverLabel);

  return (
    <div className={chartUi.card(surface)}>
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-[#39d98a]">Cluster time (7d)</p>
          <p className={`text-xs ${chartUi.sub(surface)} mt-0.5`}>Share of wall time by stage · illustrative</p>
        </div>
        <ChartMetricSlot
          show={!!hoverStage}
          className="w-[8.5rem]"
          ghost={
            <div className="rounded-lg border border-transparent px-2.5 py-1.5">
              <p className="text-xs font-mono uppercase tracking-wider">Align</p>
              <p className="text-sm font-mono tabular-nums">99%</p>
              <p className={`text-xs ${chartUi.sub(surface)}`}>≈ ~99 h wall</p>
            </div>
          }
        >
          {hoverStage ? (
            <div className={chartUi.metricBox(surface)}>
              <p className={`text-xs font-mono uppercase tracking-wider ${chartUi.sub9(surface)}`}>
                {hoverStage.label}
              </p>
              <p className={`text-sm font-mono ${chartUi.value(surface)} tabular-nums`}>{hoverStage.pct}%</p>
              <p className={`text-xs ${chartUi.sub(surface)}`}>≈ {hoverStage.estHrs} wall</p>
            </div>
          ) : null}
        </ChartMetricSlot>
      </div>
      <div className={chartUi.barTrack(surface)}>
        <div
          className="flex h-full w-full origin-left"
          style={{ transform: `scaleX(${Math.max(0.04, draw)})` }}
        >
          {stages.map((s) => (
            <button
              key={s.label}
              type="button"
              onMouseEnter={() => setHoverLabel(s.label)}
              onMouseLeave={() => setHoverLabel(null)}
              onFocus={() => setHoverLabel(s.label)}
              onBlur={() => setHoverLabel(null)}
              className={`h-full min-w-[6px] ${s.className} transition-[filter] duration-200 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#39d98a]/50`}
              style={{ width: `${s.pct}%` }}
              aria-label={`${s.label} stage ${s.pct} percent, about ${s.estHrs}`}
            />
          ))}
        </div>
      </div>
      <div className={`flex flex-wrap gap-3 mt-2.5 text-sm ${chartUi.legend(surface)}`}>
        {stages.map((s) => (
          <span
            key={s.label}
            className={`transition-colors ${chartUi.legendHi(surface, hoverLabel === s.label)}`}
          >
            <span
              className={`inline-block w-2 h-2 rounded-sm mr-1 ${s.className} transition-transform ${hoverLabel === s.label ? "scale-125" : ""}`}
            />
            {s.label}{" "}
            <span className={`${chartUi.legendNum(surface)} font-mono`}>{s.pct}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Weekly PDF count bars for reports tab. */
export function ReportVolumeBars({ surface = "dark" }: { surface?: ChartSurface }) {
  const [hoverW, setHoverW] = useState<string | null>(null);
  const weeks = useMemo(
    () => [
      { w: "W09", n: 4 },
      { w: "W10", n: 6 },
      { w: "W11", n: 5 },
      { w: "W12", n: 8 },
      { w: "W13", n: 7 },
      { w: "W14", n: 9 },
    ],
    [],
  );
  const maxN = Math.max(...weeks.map((x) => x.n), 1);
  const draw = useDrawProgress(["reports-bars"]);
  const hoverWeek = weeks.find((x) => x.w === hoverW);

  return (
    <div className={chartUi.card(surface)}>
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-[#39d98a]">PDFs generated / week</p>
          <p className={`text-xs ${chartUi.sub(surface)} mt-0.5`}>Automated run reports (demo)</p>
        </div>
        <ChartMetricSlot
          show={!!hoverWeek}
          className="w-[8.25rem]"
          ghost={
            <div className="rounded-lg border border-transparent px-2.5 py-1.5">
              <p className="text-xs font-mono uppercase tracking-wider">W14</p>
              <p className="text-sm font-mono tabular-nums">9 PDFs</p>
              <p className={`text-xs ${chartUi.sub(surface)}`}>avg 9.9/day</p>
            </div>
          }
        >
          {hoverWeek ? (
            <div className={chartUi.metricPdf(surface)}>
              <p className="text-xs font-mono uppercase tracking-wider text-[#39d98a]/90">{hoverWeek.w}</p>
              <p className={`text-sm font-mono ${chartUi.value(surface)} tabular-nums`}>{hoverWeek.n} PDFs</p>
              <p className={`text-xs ${chartUi.sub(surface)}`}>
                avg {Math.round((hoverWeek.n / 7) * 10) / 10}/day
              </p>
            </div>
          ) : null}
        </ChartMetricSlot>
      </div>
      <div className="flex items-end justify-between gap-1.5 h-24">
        {weeks.map((wk) => {
          const active = hoverW === wk.w;
          return (
            <button
              key={wk.w}
              type="button"
              className="flex-1 flex flex-col items-center gap-1 group min-h-0 justify-end focus:outline-none focus-visible:ring-2 focus-visible:ring-[#39d98a]/40 rounded pb-0.5"
              onMouseEnter={() => setHoverW(wk.w)}
              onMouseLeave={() => setHoverW(null)}
              onFocus={() => setHoverW(wk.w)}
              onBlur={() => setHoverW(null)}
              aria-label={`Week ${wk.w}, ${wk.n} PDFs generated`}
            >
              <div
                className={
                  surface === "light"
                    ? `w-full rounded-t bg-gradient-to-t transition-all duration-300 ${
                        active
                          ? "from-emerald-500/35 to-emerald-600/75 shadow-[0_0_14px_rgba(5,150,105,0.22)]"
                          : "from-emerald-500/18 to-emerald-600/52 group-hover:from-emerald-500/28 group-hover:to-emerald-600/68 group-hover:shadow-[0_0_12px_rgba(5,150,105,0.16)]"
                      }`
                    : `w-full rounded-t bg-gradient-to-t from-[#39d98a]/20 to-[#39d98a]/70 transition-all duration-300 group-hover:from-[#39d98a]/30 group-hover:to-[#39d98a]/85 group-hover:shadow-[0_0_16px_rgba(57,217,138,0.25)] ${
                        active ? "from-[#39d98a]/30 to-[#39d98a]/85 shadow-[0_0_16px_rgba(57,217,138,0.25)]" : ""
                      }`
                }
                style={{ height: `${(wk.n / maxN) * 72 * draw}px`, maxHeight: 72 }}
              />
              <span
                className={`text-xs font-mono transition-colors ${chartUi.barLabel(surface, active)}`}
              >
                {wk.w}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Stacked horizontal “pages per PDF” distribution. */
export function ReportPagesStack({ surface = "dark" }: { surface?: ChartSurface }) {
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const draw = useDrawProgress(["report-pages"]);
  const parts = useMemo(
    () => [
      { key: "qc", label: "QC + depth", pct: 32, className: "bg-sky-500/70", pages: "~4–5 pg" },
      { key: "var", label: "Variants", pct: 44, className: "bg-[#39d98a]/75", pages: "~6 pg" },
      {
        key: "app",
        label: "Appendix",
        pct: 24,
        className: surface === "light" ? "bg-slate-400/78" : "bg-zinc-500/60",
        pages: "~3–4 pg",
      },
    ],
    [surface],
  );
  const hoverPart = parts.find((p) => p.key === hoverKey);

  return (
    <div className={chartUi.card(surface)}>
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-[#39d98a]">Typical page budget</p>
          <p className={`text-xs ${chartUi.sub(surface)} mt-0.5`}>Share of pages in a 14-page report</p>
        </div>
        <ChartMetricSlot
          show={!!hoverPart}
          className="w-[11rem]"
          ghost={
            <div className="rounded-lg border border-transparent px-2.5 py-1.5">
              <p className="text-xs font-mono uppercase tracking-wider truncate">QC + depth</p>
              <p className="text-sm font-mono tabular-nums">99%</p>
              <p className={`text-xs ${chartUi.sub(surface)}`}>~4–5 pg · 14 pg total</p>
            </div>
          }
        >
          {hoverPart ? (
            <div className={chartUi.metricBox(surface)}>
              <p
                className={`text-xs font-mono uppercase tracking-wider ${chartUi.sub9(surface)} truncate`}
                title={hoverPart.label}
              >
                {hoverPart.label}
              </p>
              <p className={`text-sm font-mono ${chartUi.value(surface)} tabular-nums`}>{hoverPart.pct}%</p>
              <p className={`text-xs ${chartUi.sub(surface)}`}>{hoverPart.pages} · 14 pg total</p>
            </div>
          ) : null}
        </ChartMetricSlot>
      </div>
      <div className={chartUi.barTrack(surface)}>
        <div
          className="flex h-full w-full origin-left"
          style={{ transform: `scaleX(${Math.max(0.04, draw)})` }}
        >
          {parts.map((p) => (
            <button
              key={p.key}
              type="button"
              onMouseEnter={() => setHoverKey(p.key)}
              onMouseLeave={() => setHoverKey(null)}
              onFocus={() => setHoverKey(p.key)}
              onBlur={() => setHoverKey(null)}
              className={`h-full min-w-[8px] ${p.className} transition-[filter] duration-200 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#39d98a]/50`}
              style={{ width: `${p.pct}%` }}
              aria-label={`${p.label} ${p.pct} percent, about ${p.pages}`}
            />
          ))}
        </div>
      </div>
      <div className={`flex flex-wrap gap-3 mt-2.5 text-sm ${chartUi.legend(surface)}`}>
        {parts.map((p) => (
          <span
            key={p.key}
            className={`transition-colors ${chartUi.legendHi(surface, hoverKey === p.key)}`}
          >
            <span
              className={`inline-block w-2 h-2 rounded-sm mr-1 ${p.className} transition-transform ${hoverKey === p.key ? "scale-125" : ""}`}
            />
            {p.label}{" "}
            <span className={`${chartUi.legendNum(surface)} font-mono`}>{p.pct}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}
