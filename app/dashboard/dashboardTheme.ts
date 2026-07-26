/** Shared light / dark surface classes for LIMS dashboard (client-only).
 *  Calm lab / instrumentation palette — soft neutrals, muted teal, low visual fatigue.
 */

export const LAB = {
  accent: "#0d7377",
  accentHover: "#0a5c61",
  accentMuted: "#14919b",
  shellLight: "#f1f4f8",
  shellDark: "#1a2332",
  chromeLight: "#ffffff",
  chromeDark: "#222c3a",
  panelDark: "#243041",
  wellDark: "#151c28",
} as const;

/** Primary CTA / accent chip (works on both surfaces). */
export const accentBtn =
  "inline-flex items-center gap-2 rounded-lg border border-[#0d7377]/30 bg-[#0d7377]/10 px-4 py-2 text-xs font-semibold text-[#0d7377] hover:bg-[#0d7377]/16 transition-colors";

export const accentBtnSm =
  "inline-flex items-center gap-1.5 rounded-lg border border-[#0d7377]/30 bg-[#0d7377]/10 px-3 py-1.5 text-xs font-medium text-[#0d7377] hover:bg-[#0d7377]/16 transition-colors";

export function dashboardTokens(light: boolean) {
  const L = light;
  return {
    shell: L
      ? "min-h-screen bg-[#f1f4f8] text-slate-800 font-sans flex"
      : "min-h-screen bg-[#1a2332] text-slate-200 font-sans flex",

    sidebar: L
      ? "hidden lg:flex w-56 shrink-0 flex-col border-r border-slate-200/80 bg-white sticky top-0 h-screen"
      : "hidden lg:flex w-56 shrink-0 flex-col border-r border-white/[.08] bg-[#222c3a] sticky top-0 h-screen",
    sidebarHeaderBorder: L ? "border-b border-slate-200/80" : "border-b border-white/[.08]",
    sidebarBrandSub: L ? "text-slate-500" : "text-slate-400",
    sidebarTitle: L ? "text-slate-900" : "text-slate-50",
    sidebarFooterBorder: L ? "border-t border-slate-200/80" : "border-t border-white/[.08]",
    linkMuted: L ? "text-slate-500 hover:text-[#0a5c61]" : "text-slate-400 hover:text-[#5eead4]",

    navInactive: L
      ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
      : "text-slate-400 hover:bg-white/[.05] hover:text-slate-100 border border-transparent",
    navActive: L
      ? "bg-[#0d7377]/10 text-[#0d7377] border border-[#0d7377]/20"
      : "bg-[#0d7377]/20 text-[#5eead4] border border-[#0d7377]/30",

    header: L
      ? "h-14 shrink-0 border-b border-slate-200/80 bg-white/95 backdrop-blur flex items-center justify-between px-4 lg:px-6 gap-4"
      : "h-14 shrink-0 border-b border-white/[.08] bg-[#222c3a]/95 backdrop-blur flex items-center justify-between px-4 lg:px-6 gap-4",
    headerKicker: L ? "text-slate-500" : "text-slate-400",
    headerTitle: L ? "text-slate-900" : "text-slate-50",

    mobileNav: L
      ? "lg:hidden flex border-b border-slate-200/80 bg-white p-2 gap-1 overflow-x-auto"
      : "lg:hidden flex border-b border-white/[.08] bg-[#222c3a] p-2 gap-1 overflow-x-auto",
    mobileNavInactive: L ? "text-slate-500" : "text-slate-400",

    demoBadge: L
      ? "hidden sm:inline text-[10px] leading-tight font-medium tracking-wide px-1.5 py-0.5 rounded-md border border-amber-300/70 text-amber-900/90 bg-amber-50"
      : "hidden sm:inline text-[10px] leading-tight font-medium tracking-wide px-1.5 py-0.5 rounded-md border border-amber-500/30 text-amber-200/90 bg-amber-500/10",

    mobileDemoBanner: L
      ? "sm:hidden border-t border-amber-300/60 bg-amber-50 px-2 py-0.5 text-center text-[10px] leading-tight font-medium tracking-wide text-amber-900"
      : "sm:hidden border-t border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-center text-[10px] leading-tight font-medium tracking-wide text-amber-200/85",

    /** Ring when avatar settings menu is open */
    menuOpenRing: L
      ? "ring-2 ring-[#0d7377]/35 ring-offset-2 ring-offset-[#f1f4f8]"
      : "ring-2 ring-[#0d7377]/40 ring-offset-2 ring-offset-[#1a2332]",

    avatarPlate: L
      ? "h-9 w-9 rounded-full bg-gradient-to-br from-[#0d7377]/75 to-slate-500 border border-slate-200 flex items-center justify-center text-xs font-semibold text-white tracking-tight shrink-0 shadow-sm select-none"
      : "h-9 w-9 rounded-full bg-gradient-to-br from-[#0d7377]/60 to-slate-600 border border-white/15 flex items-center justify-center text-xs font-semibold text-white tracking-tight shrink-0 select-none",

    settingsMenu: L
      ? "absolute right-0 top-full mt-2 w-64 rounded-xl border border-slate-200 bg-white opacity-100 shadow-lg shadow-slate-900/10 p-3 z-[60] text-left backdrop-blur-none [backdrop-filter:none] isolate"
      : "absolute right-0 top-full mt-2 w-64 rounded-xl border border-white/[.10] bg-[#222c3a] opacity-100 shadow-lg shadow-black/30 p-3 z-[60] text-left backdrop-blur-none [backdrop-filter:none] isolate",
    settingsMenuTitle: L ? "text-slate-500" : "text-slate-400",
    settingsRow: L
      ? "flex cursor-pointer items-center justify-between gap-3 text-xs text-slate-700 py-1.5 px-0.5 rounded-lg hover:bg-slate-100"
      : "flex cursor-pointer items-center justify-between gap-3 text-xs text-slate-300 py-1.5 px-0.5 rounded-lg hover:bg-white/[.05]",
    /** Demo settings menu · iOS-style switch (track + inner thumb span) */
    settingsSwitchTrack: L
      ? "relative flex h-6 w-11 shrink-0 items-center rounded-full border px-[3px] transition-[background-color,border-color] duration-200 ease-out has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#0d7377]/35 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-white"
      : "relative flex h-6 w-11 shrink-0 items-center rounded-full border px-[3px] transition-[background-color,border-color] duration-200 ease-out has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#0d7377]/40 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-[#243041]",
    settingsSwitchTrackOff: L
      ? "border-slate-200 bg-slate-100"
      : "border-white/[.12] bg-white/[.08]",
    settingsSwitchTrackOn: L
      ? "border-[#0d7377]/50 bg-[#0d7377]"
      : "border-[#0d7377]/45 bg-[#0d7377]/70",
    settingsSwitchThumb:
      "pointer-events-none h-[18px] w-[18px] shrink-0 rounded-full bg-white shadow-sm ring-1 ring-black/10 transition-[margin] duration-200 ease-out",
    settingsSwitchThumbOn: "ml-auto",
    settingsCheckbox: L
      ? "rounded border-slate-300 bg-white text-[#0d7377] focus:ring-[#0d7377]/35"
      : "rounded border-white/25 bg-[#1a2332] text-[#0d7377] focus:ring-[#0d7377]/40",
    settingsFoot: L ? "border-slate-200/80 text-slate-500" : "border-white/[.08] text-slate-500",

    kpiCard: L
      ? "rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm"
      : "rounded-xl border border-white/[.08] bg-[#243041] p-4",
    kpiLabel: L ? "text-slate-500" : "text-slate-400",
    kpiValue: L ? "text-slate-900" : "text-slate-50",
    kpiDelta: L ? "text-slate-500" : "text-slate-400",

    panel: L
      ? "rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm"
      : "rounded-2xl border border-white/[.08] bg-[#243041] overflow-hidden",
    panelSectionBorder: L ? "border-b border-slate-200/80" : "border-b border-white/[.08]",
    bodyText: L ? "text-slate-600" : "text-slate-400",
    bodyTextSoft: L ? "text-slate-500" : "text-slate-400",
    accentLabel: L
      ? "text-xs font-medium text-[#0d7377] tracking-wide"
      : "text-xs font-medium text-[#5eead4] tracking-wide",

    input: L
      ? "w-full rounded-lg bg-white border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d7377]/30 focus:border-[#0d7377]/45"
      : "w-full rounded-lg bg-[#1a2332] border border-white/[.12] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0d7377]/35 focus:border-[#0d7377]/40",

    tableHead: L
      ? "border-b border-slate-200/80 text-xs font-medium tracking-wide text-slate-500"
      : "border-b border-white/[.08] text-xs font-medium tracking-wide text-slate-400",
    tableRow: L
      ? "group border-b border-slate-100 hover:bg-teal-50/70 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0d7377]/25"
      : "group border-b border-white/[.06] hover:bg-[#0d7377]/[.08] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0d7377]/30",
    tableRowPlain: L
      ? "border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
      : "border-b border-white/[.06] hover:bg-[#0d7377]/[.08] transition-colors",
    strainId: L ? "text-slate-900" : "text-slate-50",
    strainMuted: L ? "text-slate-600" : "text-slate-400",
    strainMeta: L ? "text-slate-500 font-mono text-xs" : "text-slate-400 font-mono text-xs",
    hintArrow: L ? "text-slate-400 group-hover:text-[#0d7377]/80" : "text-slate-500 group-hover:text-[#5eead4]/80",

    runsCard: L
      ? "rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3 justify-between"
      : "rounded-xl border border-white/[.08] bg-[#243041] p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between",
    runsTitle: L ? "text-slate-900" : "text-slate-50",
    runsMeta: L ? "text-slate-500" : "text-slate-400",
    runsStage: L ? "text-slate-600" : "text-slate-400",

    dashedCard: L
      ? "rounded-2xl border border-dashed border-slate-300/90 bg-slate-50/80 p-8 text-center"
      : "rounded-2xl border border-dashed border-white/[.14] bg-white/[.03] p-8 text-center",
    ghostBtn: L
      ? "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 cursor-default"
      : "inline-flex items-center gap-2 rounded-full border border-white/[.12] bg-white/[.05] px-4 py-2 text-xs font-medium text-slate-300 cursor-default",

    pillToggleWrap: L
      ? "inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50"
      : "inline-flex rounded-lg border border-white/[.10] p-0.5 bg-[#1a2332]",
    pillInactive: L ? "text-slate-500 hover:text-slate-800" : "text-slate-400 hover:text-slate-200",
    pillActive: L
      ? "bg-[#0d7377]/12 text-[#0d7377]"
      : "bg-[#0d7377]/22 text-[#5eead4]",

    secondaryBtn: L
      ? "inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50 transition-colors"
      : "inline-flex items-center gap-2 rounded-lg border border-white/[.12] bg-white/[.05] px-4 py-2 text-xs font-medium text-slate-200 hover:bg-white/[.08] transition-colors",

    codeBlock: L
      ? "rounded-xl border border-slate-200/80 bg-slate-50 overflow-hidden shadow-sm"
      : "rounded-xl border border-white/[.10] bg-[#151c28] overflow-hidden",
    codeBlockHead: L ? "border-b border-slate-200/80" : "border-b border-white/[.08]",
    codePre: L ? "text-slate-600" : "text-slate-400",

    footNote: L ? "text-slate-500" : "text-slate-500",

    toast: L
      ? "fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] rounded-xl border border-[#0d7377]/25 bg-white px-5 py-3 text-sm text-[#0d7377] shadow-lg shadow-slate-900/10 pointer-events-none"
      : "fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] rounded-xl border border-[#0d7377]/35 bg-[#222c3a] px-5 py-3 text-sm text-[#5eead4] shadow-lg shadow-black/30 pointer-events-none",

    importDrop: (drag: boolean) =>
      drag
        ? L
          ? "rounded-xl border border-dashed border-[#0d7377]/45 bg-[#0d7377]/8 text-[#0d7377]"
          : "rounded-xl border border-dashed border-[#0d7377]/45 bg-[#0d7377]/15 text-[#5eead4]"
        : L
          ? "rounded-xl border border-dashed border-slate-300/90 bg-slate-50/80 text-slate-500"
          : "rounded-xl border border-dashed border-white/[.14] bg-white/[.03] text-slate-400",
    importListDivide: L ? "divide-y divide-slate-100" : "divide-y divide-white/[.06]",
    importRowActive: L ? "bg-teal-50" : "bg-[#0d7377]/15",
    importRowHover: L ? "hover:bg-slate-50" : "hover:bg-white/[.04]",
    importPreviewBox: L
      ? "rounded-lg border border-slate-200 bg-white p-2 flex justify-center"
      : "rounded-lg border border-white/[.10] bg-[#151c28] p-2 flex justify-center",
    importPre: L
      ? "text-sm leading-relaxed font-mono text-slate-600 whitespace-pre-wrap break-words border border-slate-200 rounded-lg p-3 bg-slate-50 max-h-[min(36vh,320px)] overflow-y-auto"
      : "text-sm leading-relaxed font-mono text-slate-400 whitespace-pre-wrap break-words border border-white/[.08] rounded-lg p-3 bg-[#151c28] max-h-[min(36vh,320px)] overflow-y-auto",
    dlDt: L ? "text-slate-600" : "text-slate-500",
    dlDd: L ? "text-slate-800" : "text-slate-300",

    accentText: L ? "text-[#0d7377]" : "text-[#5eead4]",
    accentSoft: L ? "text-[#0d7377]/90" : "text-[#5eead4]/90",
    focusRing: L ? "focus-visible:ring-[#0d7377]/30" : "focus-visible:ring-[#0d7377]/40",
    ringOffset: L ? "ring-offset-[#f1f4f8]" : "ring-offset-[#1a2332]",
  };
}

export function strainStatusStyles(light: boolean): Record<
  "complete" | "running" | "qc_hold",
  { label: string; className: string }
> {
  if (!light) {
    return {
      complete: {
        label: "Indexed",
        className: "bg-[#0d7377]/20 text-[#5eead4] border-[#0d7377]/35",
      },
      running: {
        label: "Pipeline",
        className: "bg-sky-500/15 text-sky-300 border-sky-500/30",
      },
      qc_hold: {
        label: "QC hold",
        className: "bg-amber-500/15 text-amber-200 border-amber-500/30",
      },
    };
  }
  return {
    complete: {
      label: "Indexed",
      className: "bg-teal-50 text-teal-900 border-teal-200",
    },
    running: {
      label: "Pipeline",
      className: "bg-sky-50 text-sky-900 border-sky-200",
    },
    qc_hold: {
      label: "QC hold",
      className: "bg-amber-50 text-amber-900 border-amber-200",
    },
  };
}

export function drawerTokens(light: boolean) {
  const L = light;
  return {
    panel: L
      ? "relative w-full max-w-lg h-full min-h-0 border-l border-slate-200 bg-white shadow-[-12px_0_40px_rgba(15,23,42,0.08)] flex flex-col animate-[drawerIn_0.22s_ease-out]"
      : "relative w-full max-w-lg h-full min-h-0 border-l border-white/[.10] bg-[#222c3a] shadow-[-12px_0_40px_rgba(0,0,0,0.35)] flex flex-col animate-[drawerIn_0.22s_ease-out]",
    headerBorder: L ? "border-b border-slate-200/80" : "border-b border-white/[.08]",
    kicker: L ? "text-slate-500" : "text-slate-400",
    title: L ? "text-slate-900" : "text-slate-50",
    escBtn: L
      ? "shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
      : "shrink-0 rounded-lg border border-white/[.12] bg-white/[.05] px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/[.08] hover:text-white transition-colors",
    sectionTitle: L
      ? "text-xs font-medium tracking-wide text-[#0d7377] mb-3"
      : "text-xs font-medium tracking-wide text-[#5eead4] mb-3",
    sectionTitlePlain: L
      ? "text-xs font-medium tracking-wide text-[#0d7377]"
      : "text-xs font-medium tracking-wide text-[#5eead4]",
    dt: L ? "text-slate-500 text-xs mb-0.5" : "text-slate-400 text-xs mb-0.5",
    dd: L ? "text-slate-800" : "text-slate-200",
    ddMuted: L ? "text-slate-700 font-mono text-xs" : "text-slate-300 font-mono text-xs",
    ddAccent: L ? "text-[#0d7377] font-mono text-xs" : "text-[#5eead4] font-mono text-xs",
    vcf: L ? "text-sky-700" : "text-sky-300/90",
    auditList: L
      ? "space-y-2 text-xs text-slate-600 border border-slate-200 rounded-xl p-4 bg-slate-50/80"
      : "space-y-2 text-xs text-slate-400 border border-white/[.08] rounded-xl p-4 bg-white/[.03]",
    auditDate: L ? "text-slate-500 font-mono shrink-0" : "text-slate-500 font-mono shrink-0",
    notes: L ? "text-slate-600" : "text-slate-400",
  };
}

/** Project drawer + form fields */
export function drawerForm(light: boolean) {
  const L = light;
  return {
    input: L
      ? "font-sans w-full rounded-lg bg-white border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d7377]/30"
      : "font-sans w-full rounded-lg bg-[#1a2332] border border-white/[.12] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0d7377]/35",
    inputMt: L
      ? "font-sans mt-1 w-full rounded-lg bg-white border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d7377]/30"
      : "font-sans mt-1 w-full rounded-lg bg-[#1a2332] border border-white/[.12] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0d7377]/35",
    textarea: L
      ? "font-sans mt-1 w-full rounded-lg bg-white border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0d7377]/30 resize-y min-h-[100px]"
      : "font-sans mt-1 w-full rounded-lg bg-[#1a2332] border border-white/[.12] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0d7377]/35 resize-y min-h-[100px]",
    /** Native selects often ignore inherited font; keep closed + option list aligned with inputs (Geist via font-sans). */
    select: L
      ? "font-sans [&>option]:font-sans rounded-lg bg-white border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d7377]/30"
      : "font-sans [&>option]:font-sans rounded-lg bg-[#1a2332] border border-white/[.12] px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d7377]/35",
    selectSm: L
      ? "font-sans [&>option]:font-sans rounded bg-white border border-slate-200 px-2 py-1 text-sm text-slate-800"
      : "font-sans [&>option]:font-sans rounded bg-[#1a2332] border border-white/[.12] px-2 py-1 text-sm text-slate-300",
    labelMono: L ? "text-slate-600 text-xs font-medium" : "text-slate-400 text-xs font-medium",
    footer: L
      ? "shrink-0 p-4 border-t border-slate-200/80 flex gap-2 justify-end bg-slate-50"
      : "shrink-0 p-4 border-t border-white/[.08] flex gap-2 justify-end bg-[#1a2332]",
    listWrap: L
      ? "space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/80"
      : "space-y-2 border border-white/[.08] rounded-xl p-3 bg-white/[.03]",
    listRowBorder: L ? "border-b border-slate-100 last:border-0" : "border-b border-white/[.06] last:border-0",
    emailText: L ? "font-mono text-slate-800 truncate flex-1" : "font-mono text-slate-200 truncate flex-1",
    metaLine: L ? "text-xs text-slate-500 font-mono" : "text-xs text-slate-500 font-mono",
    lifecycle: L ? "text-sm text-slate-700" : "text-sm text-slate-300",
    checkbox: L
      ? "rounded border-slate-300 bg-white text-[#0d7377] focus:ring-[#0d7377]/35"
      : "rounded border-white/20 bg-[#1a2332] text-[#0d7377] focus:ring-[#0d7377]/40",
    emptyHint: L ? "text-xs text-slate-500" : "text-xs text-slate-400",
    removeLink: L
      ? "text-amber-800/90 hover:text-amber-950 text-sm"
      : "text-amber-300/90 hover:text-amber-200 text-sm",
  };
}
