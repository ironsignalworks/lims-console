/** Shared light / dark surface classes for LIMS dashboard (client-only). */

export function dashboardTokens(light: boolean) {
  const L = light;
  return {
    shell: L
      ? "min-h-screen bg-[#eef2f6] text-slate-800 font-sans flex"
      : "min-h-screen bg-[#060a0e] text-zinc-200 font-sans flex",

    sidebar: L
      ? "hidden lg:flex w-56 shrink-0 flex-col border-r border-slate-200/90 bg-white sticky top-0 h-screen"
      : "hidden lg:flex w-56 shrink-0 flex-col border-r border-white/[.06] bg-[#080d12] sticky top-0 h-screen",
    sidebarHeaderBorder: L ? "border-b border-slate-200/90" : "border-b border-white/[.06]",
    sidebarBrandSub: L ? "text-slate-500" : "text-zinc-500",
    sidebarTitle: L ? "text-slate-900" : "text-white",
    sidebarFooterBorder: L ? "border-t border-slate-200/90" : "border-t border-white/[.06]",
    linkMuted: L ? "text-slate-500 hover:text-[#2bbf72]" : "text-zinc-500 hover:text-[#39d98a]",

    navInactive: L
      ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
      : "text-zinc-400 hover:bg-white/[.04] hover:text-zinc-200 border border-transparent",
    navActive:
      "bg-[#39d98a]/10 text-[#39d98a] border border-[#39d98a]/20",

    header: L
      ? "h-14 shrink-0 border-b border-slate-200/90 bg-white/95 backdrop-blur flex items-center justify-between px-4 lg:px-6 gap-4"
      : "h-14 shrink-0 border-b border-white/[.06] bg-[#080d12]/90 backdrop-blur flex items-center justify-between px-4 lg:px-6 gap-4",
    headerKicker: L ? "text-slate-500" : "text-zinc-500",
    headerTitle: L ? "text-slate-900" : "text-white",

    mobileNav: L
      ? "lg:hidden flex border-b border-slate-200/90 bg-white p-2 gap-1 overflow-x-auto"
      : "lg:hidden flex border-b border-white/[.06] bg-[#080d12] p-2 gap-1 overflow-x-auto",
    mobileNavInactive: L ? "text-slate-500" : "text-zinc-500",

    demoBadge: L
      ? "hidden sm:inline text-[10px] leading-tight font-mono uppercase tracking-widest px-1.5 py-0.5 rounded-md border border-amber-400/45 text-amber-800/95 bg-amber-50/90"
      : "hidden sm:inline text-[10px] leading-tight font-mono uppercase tracking-widest px-1.5 py-0.5 rounded-md border border-amber-500/25 text-amber-400/85 bg-amber-500/5",

    mobileDemoBanner: L
      ? "sm:hidden border-t border-amber-400/40 bg-amber-50 px-2 py-0.5 text-center text-[10px] leading-tight font-mono uppercase tracking-widest text-amber-800"
      : "sm:hidden border-t border-amber-500/20 bg-amber-500/5 px-2 py-0.5 text-center text-[10px] leading-tight font-mono uppercase tracking-widest text-amber-400/80",

    /** Ring when avatar settings menu is open */
    menuOpenRing: L
      ? "ring-2 ring-[#39d98a]/40 ring-offset-2 ring-offset-[#eef2f6]"
      : "ring-2 ring-[#39d98a]/35 ring-offset-2 ring-offset-[#060a0e]",

    avatarPlate: L
      ? "h-9 w-9 rounded-full bg-gradient-to-br from-[#39d98a]/70 to-slate-600 border border-slate-300/80 flex items-center justify-center text-xs font-bold text-white font-mono tracking-tight shrink-0 shadow-sm select-none"
      : "h-9 w-9 rounded-full bg-gradient-to-br from-[#39d98a]/50 to-zinc-700 border border-white/15 flex items-center justify-center text-xs font-bold text-white font-mono tracking-tight shrink-0 select-none",

    settingsMenu: L
      ? "absolute right-0 top-full mt-2 w-64 rounded-xl border border-slate-200 bg-white opacity-100 shadow-xl shadow-slate-900/15 p-3 z-[60] text-left backdrop-blur-none [backdrop-filter:none] isolate"
      : "absolute right-0 top-full mt-2 w-64 rounded-xl border border-white/[.14] bg-[#060a0e] opacity-100 shadow-xl shadow-black/50 p-3 z-[60] text-left backdrop-blur-none [backdrop-filter:none] isolate",
    settingsMenuTitle: L ? "text-slate-500" : "text-zinc-500",
    settingsRow: L
      ? "flex cursor-pointer items-center justify-between gap-3 text-xs text-slate-700 py-1.5 px-0.5 rounded-lg hover:bg-slate-100"
      : "flex cursor-pointer items-center justify-between gap-3 text-xs text-zinc-300 py-1.5 px-0.5 rounded-lg hover:bg-white/[.04]",
    /** Demo settings menu · iOS-style switch (track + inner thumb span) */
    settingsSwitchTrack: L
      ? "relative flex h-6 w-11 shrink-0 items-center rounded-full border px-[3px] transition-[background-color,border-color] duration-200 ease-out has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#39d98a]/40 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-white"
      : "relative flex h-6 w-11 shrink-0 items-center rounded-full border px-[3px] transition-[background-color,border-color] duration-200 ease-out has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#39d98a]/35 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-[#0a1016]",
    settingsSwitchTrackOff: L
      ? "border-slate-200/90 bg-slate-100"
      : "border-white/[.10] bg-white/[.06]",
    settingsSwitchTrackOn: L
      ? "border-[#39d98a]/55 bg-[#39d98a]/85"
      : "border-[#39d98a]/40 bg-[#39d98a]/55",
    settingsSwitchThumb:
      "pointer-events-none h-[18px] w-[18px] shrink-0 rounded-full bg-white shadow-sm ring-1 ring-black/10 transition-[margin] duration-200 ease-out",
    settingsSwitchThumbOn: "ml-auto",
    settingsCheckbox: L
      ? "rounded border-slate-300 bg-white text-[#39d98a] focus:ring-[#39d98a]/40"
      : "rounded border-white/25 bg-[#060a0e] text-[#39d98a] focus:ring-[#39d98a]/40",
    settingsFoot: L ? "border-slate-200/80 text-slate-500" : "border-white/[.06] text-zinc-600",

    kpiCard: L
      ? "rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm"
      : "rounded-xl border border-white/[.07] bg-white/[.02] p-4",
    kpiLabel: L ? "text-slate-500" : "text-zinc-500",
    kpiValue: L ? "text-slate-900" : "text-white",
    kpiDelta: L ? "text-slate-500" : "text-zinc-500",

    panel: L
      ? "rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm"
      : "rounded-2xl border border-white/[.07] bg-[#0a1016] overflow-hidden",
    panelSectionBorder: L ? "border-b border-slate-200/90" : "border-b border-white/[.06]",
    bodyText: L ? "text-slate-600" : "text-zinc-400",
    bodyTextSoft: L ? "text-slate-500" : "text-zinc-500",
    accentLabel: "text-xs font-mono text-[#39d98a] uppercase tracking-widest",

    input: L
      ? "w-full rounded-lg bg-white border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#39d98a]/35 focus:border-[#39d98a]/50"
      : "w-full rounded-lg bg-[#060a0e] border border-white/[.10] px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#39d98a]/40 focus:border-[#39d98a]/40",

    tableHead: L
      ? "border-b border-slate-200/90 text-xs font-mono uppercase tracking-widest text-slate-500"
      : "border-b border-white/[.06] text-xs font-mono uppercase tracking-widest text-zinc-500",
    tableRow: L
      ? "group border-b border-slate-100 hover:bg-emerald-50/60 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#39d98a]/30"
      : "group border-b border-white/[.04] hover:bg-[#39d98a]/[.04] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#39d98a]/35",
    tableRowPlain: L
      ? "border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
      : "border-b border-white/[.04] hover:bg-[#39d98a]/[.04] transition-colors",
    strainId: L ? "text-slate-900" : "text-white",
    strainMuted: L ? "text-slate-600" : "text-zinc-400",
    strainMeta: L ? "text-slate-500 font-mono text-xs" : "text-zinc-500 font-mono text-xs",
    hintArrow: L ? "text-slate-400 group-hover:text-[#39d98a]/80" : "text-zinc-600 group-hover:text-[#39d98a]/70",

    runsCard: L
      ? "rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3 justify-between"
      : "rounded-xl border border-white/[.07] bg-[#0a1016] p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between",
    runsTitle: L ? "text-slate-900" : "text-white",
    runsMeta: L ? "text-slate-500" : "text-zinc-500",
    runsStage: L ? "text-slate-600" : "text-zinc-400",

    dashedCard: L
      ? "rounded-2xl border border-dashed border-slate-300/90 bg-slate-50/80 p-8 text-center"
      : "rounded-2xl border border-dashed border-white/[.12] bg-white/[.02] p-8 text-center",
    ghostBtn: L
      ? "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 cursor-default"
      : "inline-flex items-center gap-2 rounded-full border border-white/[.12] bg-white/[.05] px-4 py-2 text-xs font-medium text-zinc-300 cursor-default",

    pillToggleWrap: L
      ? "inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50"
      : "inline-flex rounded-lg border border-white/[.08] p-0.5 bg-[#0a1016]",
    pillInactive: L ? "text-slate-500 hover:text-slate-800" : "text-zinc-500 hover:text-zinc-300",

    secondaryBtn: L
      ? "inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50 transition-colors"
      : "inline-flex items-center gap-2 rounded-lg border border-white/[.12] bg-white/[.05] px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-white/[.08] transition-colors",

    codeBlock: L
      ? "rounded-xl border border-slate-200/90 bg-slate-50 overflow-hidden shadow-sm"
      : "rounded-xl border border-white/[.08] bg-[#05080b] overflow-hidden",
    codeBlockHead: L ? "border-b border-slate-200/90" : "border-b border-white/[.06]",
    codePre: L ? "text-slate-600" : "text-zinc-400",

    footNote: L ? "text-slate-500" : "text-zinc-600",

    importDrop: (drag: boolean) =>
      drag
        ? "rounded-xl border border-dashed border-[#39d98a]/50 bg-[#39d98a]/10 text-[#39d98a]"
        : L
          ? "rounded-xl border border-dashed border-slate-300/90 bg-slate-50/80 text-slate-500"
          : "rounded-xl border border-dashed border-white/[.12] bg-white/[.02] text-zinc-500",
    importListDivide: L ? "divide-y divide-slate-100" : "divide-y divide-white/[.05]",
    importRowActive: L ? "bg-emerald-50" : "bg-[#39d98a]/8",
    importRowHover: L ? "hover:bg-slate-50" : "hover:bg-white/[.03]",
    importPreviewBox: L ? "rounded-lg border border-slate-200 bg-white p-2 flex justify-center" : "rounded-lg border border-white/[.08] bg-black/40 p-2 flex justify-center",
    importPre: L
      ? "text-sm leading-relaxed font-mono text-slate-600 whitespace-pre-wrap break-words border border-slate-200 rounded-lg p-3 bg-slate-50 max-h-[min(36vh,320px)] overflow-y-auto"
      : "text-sm leading-relaxed font-mono text-zinc-400 whitespace-pre-wrap break-words border border-white/[.06] rounded-lg p-3 bg-black/30 max-h-[min(36vh,320px)] overflow-y-auto",
    dlDt: L ? "text-slate-600" : "text-zinc-600",
    dlDd: L ? "text-slate-800" : "text-zinc-300",
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
        className: "bg-[#39d98a]/15 text-[#39d98a] border-[#39d98a]/25",
      },
      running: {
        label: "Pipeline",
        className: "bg-sky-500/15 text-sky-300 border-sky-500/25",
      },
      qc_hold: {
        label: "QC hold",
        className: "bg-amber-500/15 text-amber-300 border-amber-500/25",
      },
    };
  }
  return {
    complete: {
      label: "Indexed",
      className: "bg-emerald-100 text-emerald-900 border-emerald-200",
    },
    running: {
      label: "Pipeline",
      className: "bg-sky-100 text-sky-900 border-sky-200",
    },
    qc_hold: {
      label: "QC hold",
      className: "bg-amber-100 text-amber-900 border-amber-200",
    },
  };
}

export function drawerTokens(light: boolean) {
  const L = light;
  return {
    panel: L
      ? "relative w-full max-w-lg h-full min-h-0 border-l border-slate-200 bg-white shadow-[-12px_0_48px_rgba(15,23,42,0.12)] flex flex-col animate-[drawerIn_0.22s_ease-out]"
      : "relative w-full max-w-lg h-full min-h-0 border-l border-white/[.08] bg-[#060a0e] shadow-[-12px_0_48px_rgba(0,0,0,0.5)] flex flex-col animate-[drawerIn_0.22s_ease-out]",
    headerBorder: L ? "border-b border-slate-200/90" : "border-b border-white/[.06]",
    kicker: L ? "text-slate-500" : "text-zinc-500",
    title: L ? "text-slate-900" : "text-white",
    escBtn: L
      ? "shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-mono text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
      : "shrink-0 rounded-lg border border-white/[.12] bg-white/[.04] px-3 py-1.5 text-xs font-mono text-zinc-300 hover:bg-white/[.08] hover:text-white transition-colors",
    sectionTitle: "text-xs font-mono uppercase tracking-widest text-[#39d98a] mb-3",
    sectionTitlePlain: "text-xs font-mono uppercase tracking-widest text-[#39d98a]",
    dt: L ? "text-slate-500 text-xs font-mono mb-0.5" : "text-zinc-500 text-xs font-mono mb-0.5",
    dd: L ? "text-slate-800" : "text-zinc-200",
    ddMuted: L ? "text-slate-700 font-mono text-xs" : "text-zinc-300 font-mono text-xs",
    vcf: L ? "text-sky-700" : "text-sky-300/90",
    auditList: L
      ? "space-y-2 text-xs text-slate-600 border border-slate-200 rounded-xl p-4 bg-slate-50/80"
      : "space-y-2 text-xs text-zinc-400 border border-white/[.06] rounded-xl p-4 bg-white/[.02]",
    auditDate: L ? "text-slate-500 font-mono shrink-0" : "text-zinc-600 font-mono shrink-0",
    notes: L ? "text-slate-600" : "text-zinc-500",
  };
}

/** Project drawer + form fields */
export function drawerForm(light: boolean) {
  const L = light;
  return {
    input: L
      ? "font-sans w-full rounded-lg bg-white border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#39d98a]/40"
      : "font-sans w-full rounded-lg bg-[#060a0e] border border-white/[.10] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#39d98a]/40",
    inputMt: L
      ? "font-sans mt-1 w-full rounded-lg bg-white border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#39d98a]/40"
      : "font-sans mt-1 w-full rounded-lg bg-[#060a0e] border border-white/[.10] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#39d98a]/40",
    textarea: L
      ? "font-sans mt-1 w-full rounded-lg bg-white border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#39d98a]/40 resize-y min-h-[100px]"
      : "font-sans mt-1 w-full rounded-lg bg-[#060a0e] border border-white/[.10] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#39d98a]/40 resize-y min-h-[100px]",
    /** Native selects often ignore inherited font; keep closed + option list aligned with inputs (Geist via font-sans). */
    select: L
      ? "font-sans [&>option]:font-sans rounded-lg bg-white border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#39d98a]/40"
      : "font-sans [&>option]:font-sans rounded-lg bg-[#060a0e] border border-white/[.10] px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#39d98a]/40",
    selectSm: L
      ? "font-sans [&>option]:font-sans rounded bg-white border border-slate-200 px-2 py-1 text-sm text-slate-800"
      : "font-sans [&>option]:font-sans rounded bg-[#060a0e] border border-white/[.10] px-2 py-1 text-sm text-zinc-300",
    labelMono: L ? "text-slate-600 font-mono" : "text-zinc-500 font-mono",
    footer: L ? "shrink-0 p-4 border-t border-slate-200/90 flex gap-2 justify-end bg-slate-50" : "shrink-0 p-4 border-t border-white/[.06] flex gap-2 justify-end bg-[#080d12]",
    listWrap: L
      ? "space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/80"
      : "space-y-2 border border-white/[.06] rounded-xl p-3 bg-white/[.02]",
    listRowBorder: L ? "border-b border-slate-100 last:border-0" : "border-b border-white/[.05] last:border-0",
    emailText: L ? "font-mono text-slate-800 truncate flex-1" : "font-mono text-zinc-200 truncate flex-1",
    metaLine: L ? "text-xs text-slate-500 font-mono" : "text-xs text-zinc-600 font-mono",
    lifecycle: L ? "text-sm text-slate-700" : "text-sm text-zinc-300",
    checkbox: L
      ? "rounded border-slate-300 bg-white text-[#39d98a] focus:ring-[#39d98a]/40"
      : "rounded border-white/20 bg-[#060a0e] text-[#39d98a] focus:ring-[#39d98a]/40",
    emptyHint: L ? "text-xs text-slate-500" : "text-xs text-zinc-500",
    removeLink: L
      ? "text-amber-800/90 hover:text-amber-950 text-sm font-mono"
      : "text-amber-400/90 hover:text-amber-300 text-sm font-mono",
  };
}
