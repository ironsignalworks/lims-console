/** Escapes a string for use inside R double-quoted character vector literals. */
function rStr(s: string): string {
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

export type StrainForRExport = { status: "complete" | "running" | "qc_hold" };
export type RunForRExport = { id: string; files: number; state: "ok" | "active" | "warn" };

/** Same initial series as the Q30 sparkline demo (fractions 0–1). */
export const DEMO_Q30_SERIES = [
  0.91, 0.93, 0.92, 0.94, 0.935, 0.942, 0.938, 0.945, 0.941, 0.942,
] as const;

function strainStatusCounts(strains: StrainForRExport[]) {
  let complete = 0;
  let running = 0;
  let qc_hold = 0;
  for (const s of strains) {
    if (s.status === "complete") complete++;
    else if (s.status === "running") running++;
    else qc_hold++;
  }
  return { complete, running, qc_hold };
}

const REPORT_WEEKS = [
  { w: "W09", n: 4 },
  { w: "W10", n: 6 },
  { w: "W11", n: 5 },
  { w: "W12", n: 8 },
  { w: "W13", n: 7 },
  { w: "W14", n: 9 },
] as const;

const STAGE_SHARE = [
  { label: "QC", pct: 22 },
  { label: "Align", pct: 35 },
  { label: "Call", pct: 28 },
  { label: "Other", pct: 15 },
] as const;

const REPORT_PAGE_PARTS = [
  { label: "QC + depth", pct: 32 },
  { label: "Variants", pct: 44 },
  { label: "Appendix", pct: 24 },
] as const;

export type LimsRVisualizationInput = {
  strains: StrainForRExport[];
  runs: RunForRExport[];
  /** Optional subtitle in generated header (e.g. "filtered table"). */
  dataNote?: string;
};

/**
 * Self-contained R script: ggplot2 reproduction of LIMS console demo charts + ggsave PNGs.
 * Run in R 4.0+ from an empty folder (creates ./lims_r_export/).
 */
export function buildLimsVisualizationRScript(input: LimsRVisualizationInput): string {
  const { strains, runs, dataNote } = input;
  const c = strainStatusCounts(strains);
  const note = dataNote ? ` (${dataNote})` : "";

  const runIds = runs.map((r) => rStr(r.id)).join(", ");
  const runFiles = runs.map((r) => String(r.files)).join(", ");
  const runState = runs.map((r) => rStr(r.state)).join(", ");

  const q30 = [...DEMO_Q30_SERIES].map((v) => v.toFixed(6)).join(", ");

  return `# YeastGenomics · LIMS console chart export (ggplot2)${note}
# Generated for reproducible figures. Run:  source("yeastgenomics_lims_charts.R")
# Writes PNGs under ./lims_r_export/

out_dir <- "lims_r_export"
dir.create(out_dir, showWarnings = FALSE, recursive = TRUE)

suppressPackageStartupMessages({
  library(ggplot2)
})

theme_lims <- function() {
  theme_minimal(base_size = 11) +
    theme(
      plot.background = element_rect(fill = "#f1f4f8", color = NA),
      panel.background = element_rect(fill = "white", color = NA),
      text = element_text(color = "#1e293b"),
      axis.text = element_text(color = "#475569"),
      panel.grid.major = element_line(color = "#e2e8f0", linewidth = 0.3),
      panel.grid.minor = element_blank(),
      plot.title = element_text(face = "bold", color = "#0d7377"),
      plot.subtitle = element_text(color = "#64748b", size = 9)
    )
}

accent <- "#0d7377"
sky <- "#38bdf8"
amber <- "#fbbf24"

# --- 1) Strain registry status mix ---
status_df <- data.frame(
  status = factor(
    c("Indexed", "Pipeline", "QC hold"),
    levels = c("Indexed", "Pipeline", "QC hold")
  ),
  n = c(${c.complete}L, ${c.running}L, ${c.qc_hold}L),
  fill = c(accent, sky, amber)
)
status_df <- subset(status_df, n > 0)

p_status <- ggplot(status_df, aes(x = status, y = n, fill = fill)) +
  geom_col(width = 0.65, show.legend = FALSE) +
  scale_fill_identity() +
  labs(title = "LIMS status mix", subtitle = "Strain registry counts", x = NULL, y = "Strains") +
  theme_lims()

ggsave(file.path(out_dir, "01_strain_status_mix.png"), p_status, width = 7, height = 4, dpi = 150, bg = "#f1f4f8")

# --- 2) Mean Q30 trend (demo series) ---
q30_frac <- c(${q30})
runs_ord <- seq_along(q30_frac)
q30_df <- data.frame(run_index = runs_ord, q30_pct = q30_frac * 100)

p_q30 <- ggplot(q30_df, aes(x = run_index, y = q30_pct)) +
  geom_ribbon(aes(ymin = min(q30_pct) - 1, ymax = q30_pct), fill = alpha(accent, 0.25), show.legend = FALSE) +
  geom_line(color = accent, size = 0.9) +
  geom_point(color = accent, size = 2) +
  scale_y_continuous(labels = function(x) paste0(x, "%"), limits = c(NA, NA)) +
  labs(title = "Mean Q30 (10 runs)", subtitle = "Synthetic demo tail; same shape as console sparkline", x = "Run order (older → newer)", y = "Q30 %") +
  theme_lims()

ggsave(file.path(out_dir, "02_mean_q30_sparkline.png"), p_q30, width = 7.5, height = 4, dpi = 150, bg = "#f1f4f8")

# --- 3) FASTQ pairs per pipeline run ---
runs_df <- data.frame(
  id = factor(c(${runIds}), levels = c(${runIds})),
  files = c(${runFiles}),
  state = c(${runState})
)
runs_df$state_col <- ifelse(runs_df$state == "ok", accent,
                      ifelse(runs_df$state == "active", sky, amber))

p_runs <- ggplot(runs_df, aes(x = id, y = files, fill = state_col)) +
  geom_col(width = 0.55, show.legend = FALSE) +
  scale_fill_identity() +
  labs(title = "FASTQ pairs / run", subtitle = "Relative batch size", x = NULL, y = "Pairs") +
  theme_lims() +
  theme(axis.text.x = element_text(angle = 35, hjust = 1, size = 8))

ggsave(file.path(out_dir, "03_fastq_pairs_per_run.png"), p_runs, width = 8, height = 4.2, dpi = 150, bg = "#f1f4f8")

# --- 4) Cluster time by stage (stacked share) ---
stage_df <- data.frame(
  stage = factor(c(${STAGE_SHARE.map((s) => rStr(s.label)).join(", ")}), levels = c(${STAGE_SHARE.map((s) => rStr(s.label)).join(", ")})),
  pct = c(${STAGE_SHARE.map((s) => String(s.pct)).join(", ")})
)
stage_df$fill <- c(amber, sky, accent, "#71717a")[as.integer(stage_df$stage)]

p_stage <- ggplot(stage_df, aes(x = "", y = pct, fill = stage)) +
  geom_col(width = 0.22, position = position_stack(), color = NA) +
  scale_fill_manual(values = setNames(stage_df$fill, stage_df$stage)) +
  coord_flip() +
  labs(title = "Cluster time (7d)", subtitle = "Share of wall time by stage", x = NULL, y = "Percent") +
  theme_lims() +
  theme(axis.text.y = element_blank(), legend.position = "bottom")

ggsave(file.path(out_dir, "04_cluster_time_by_stage.png"), p_stage, width = 8, height = 3.5, dpi = 150, bg = "#f1f4f8")

# --- 5) PDFs generated / week ---
week_df <- data.frame(
  week = factor(c(${REPORT_WEEKS.map((w) => rStr(w.w)).join(", ")}), levels = c(${REPORT_WEEKS.map((w) => rStr(w.w)).join(", ")})),
  n = c(${REPORT_WEEKS.map((w) => String(w.n)).join(", ")})
)

p_weeks <- ggplot(week_df, aes(x = week, y = n)) +
  geom_col(fill = alpha(accent, 0.75), width = 0.65) +
  labs(title = "PDFs generated / week", subtitle = "Automated run reports", x = NULL, y = "Count") +
  theme_lims()

ggsave(file.path(out_dir, "05_pdfs_per_week.png"), p_weeks, width = 7.5, height = 4, dpi = 150, bg = "#f1f4f8")

# --- 6) Typical page budget (stacked) ---
page_df <- data.frame(
  section = factor(c(${REPORT_PAGE_PARTS.map((p) => rStr(p.label)).join(", ")}), levels = c(${REPORT_PAGE_PARTS.map((p) => rStr(p.label)).join(", ")})),
  pct = c(${REPORT_PAGE_PARTS.map((p) => String(p.pct)).join(", ")})
)
page_df$fill <- c(sky, accent, "#71717a")[as.integer(page_df$section)]

p_pages <- ggplot(page_df, aes(x = "", y = pct, fill = section)) +
  geom_col(width = 0.22, position = position_stack(), color = NA) +
  scale_fill_manual(values = setNames(page_df$fill, page_df$section)) +
  coord_flip() +
  labs(title = "Typical page budget", subtitle = "Share of pages in a 14-page report", x = NULL, y = "Percent") +
  theme_lims() +
  theme(axis.text.y = element_blank(), legend.position = "bottom")

ggsave(file.path(out_dir, "06_report_page_budget.png"), p_pages, width = 8, height = 3.5, dpi = 150, bg = "#f1f4f8")

message("Saved 6 PNGs to ", normalizePath(out_dir, winslash = "/", mustWork = FALSE))
`;
}

/** Max UTF-8 characters read into generated R (keeps browser + R paste stable). */
export const R_IMPORT_MAX_CHARS = 400_000;
/** Max lines embedded in the generated \`c(...)\` literal. */
export const R_IMPORT_MAX_LINES = 10_000;

function safeImportBasename(name: string): string {
  const tail = name.replace(/\\/g, "/").split("/").pop() || "imported.txt";
  const cleaned = tail.replace(/[^\w.\-]+/g, "_");
  return cleaned.slice(0, 180) || "imported.txt";
}

/**
 * Builds R code that recreates an uploaded text file when sourced (UTF-8 via writeLines).
 * Binary files should not be passed as UTF-8 text; use small CSV/TSV/txt for best results.
 */
export function buildRCodeFromImportedTextFile(fileName: string, utf8Text: string): string {
  const dest = safeImportBasename(fileName);
  let text = utf8Text;
  let truncatedChars = false;
  if (text.length > R_IMPORT_MAX_CHARS) {
    text = text.slice(0, R_IMPORT_MAX_CHARS);
    truncatedChars = true;
  }
  const lines = text.split(/\r\n|\n|\r/);
  const truncatedLines = lines.length > R_IMPORT_MAX_LINES;
  const slice = truncatedLines ? lines.slice(0, R_IMPORT_MAX_LINES) : lines;
  const noteParts: string[] = [];
  if (truncatedChars) noteParts.push(`truncated to ${R_IMPORT_MAX_CHARS} characters`);
  if (truncatedLines) noteParts.push(`truncated to ${R_IMPORT_MAX_LINES} lines`);
  const note = noteParts.length ? `# Note: ${noteParts.join("; ")}.\n` : "";

  const body = slice.map((line) => `  ${rStr(line)}`).join(",\n");
  const empty = slice.length === 0;

  return `${note}# --- Imported file as R (from dashboard) ---
# Writes UTF-8 text next to getwd() when sourced. Original name: ${fileName.replace(/\\/g, "/")}
dest_file <- ${rStr(dest)}
lines_vec <- ${empty ? "character(0)" : `c(\n${body}\n)`}
writeLines(lines_vec, dest_file, useBytes = TRUE)
cat("Imported:", length(lines_vec), "lines ->", normalizePath(dest_file, winslash = "/", mustWork = FALSE), "\\n")`;
}
