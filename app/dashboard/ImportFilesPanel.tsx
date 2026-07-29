"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  analyzeFile,
  formatBytes,
  type FileAnalysis,
  type FileAnalysisCategory,
} from "./importFileAnalysis";
import { accentBtn, dashboardTokens } from "./dashboardTheme";

type ImportRow = {
  id: string;
  file: File;
  loading: boolean;
  analysis?: FileAnalysis;
  error?: string;
};

function keyOf(f: File): string {
  const rel = (f as File & { webkitRelativePath?: string }).webkitRelativePath ?? "";
  return `${rel}|${f.name}|${f.size}|${f.lastModified}`;
}

const CATEGORY_STYLES: Record<FileAnalysisCategory, string> = {
  json: "border-sky-500/25 text-sky-300 bg-sky-500/10",
  text: "border-zinc-500/25 text-zinc-300 bg-zinc-500/10",
  tabular: "border-emerald-500/25 text-emerald-300 bg-emerald-500/10",
  script: "border-violet-500/25 text-violet-300 bg-violet-500/10",
  image: "border-fuchsia-500/25 text-fuchsia-300 bg-fuchsia-500/10",
  archive_gzip: "border-amber-500/25 text-amber-300 bg-amber-500/10",
  archive_zip: "border-orange-500/25 text-orange-300 bg-orange-500/10",
  numpy: "border-cyan-500/25 text-cyan-300 bg-cyan-500/10",
  binary: "border-zinc-600/40 text-zinc-400 bg-zinc-500/5",
  unknown: "border-white/[.12] text-zinc-400 bg-white/[.04]",
};

export function ImportFilesPanel({ lightMode = false }: { lightMode?: boolean }) {
  const th = dashboardTokens(lightMode);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const mergeFiles = useCallback((incoming: File[]) => {
    setRows((prev) => {
      const seen = new Set(prev.map((r) => keyOf(r.file)));
      const novel: ImportRow[] = [];
      for (const f of incoming) {
        const k = keyOf(f);
        if (seen.has(k)) continue;
        seen.add(k);
        novel.push({
          id: crypto.randomUUID(),
          file: f,
          loading: true,
        });
      }
      if (!novel.length) return prev;
      const next = [...prev, ...novel];
      return next;
    });
  }, []);

  useEffect(() => {
    const pending = rows.filter((r) => r.loading && !r.analysis && !r.error);
    if (!pending.length) return;
    void Promise.all(
      pending.map(async (row) => {
        const rowId = row.id;
        try {
          const analysis = await analyzeFile(row.file);
          setRows((cur) => {
            const current = cur.find((x) => x.id === rowId);
            if (!current?.loading) return cur;
            return cur.map((x) => (x.id === rowId ? { ...x, analysis, loading: false } : x));
          });
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          setRows((cur) => {
            const current = cur.find((x) => x.id === rowId);
            if (!current?.loading) return cur;
            return cur.map((x) => (x.id === rowId ? { ...x, loading: false, error: msg } : x));
          });
        }
      }),
    );
  }, [rows]);

  const selected = useMemo(
    () => rows.find((r) => r.id === selectedId) ?? rows[rows.length - 1] ?? null,
    [rows, selectedId],
  );

  useEffect(() => {
    let url: string | null = null;
    if (selected?.analysis?.category === "image" && selected.file) {
      url = URL.createObjectURL(selected.file);
      setImagePreviewUrl(url);
    } else {
      setImagePreviewUrl(null);
    }
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [selected?.id, selected?.analysis?.category, selected?.file]);

  const onFilesPicked = useCallback(
    (list: FileList | null) => {
      if (!list?.length) return;
      mergeFiles(Array.from(list));
    },
    [mergeFiles],
  );

  const clearAll = useCallback(() => {
    setRows([]);
    setSelectedId(null);
  }, []);

  const folderDepth = useMemo(() => {
    if (!rows.length) return 0;
    return rows.reduce((max, r) => {
      const p = (r.file as File & { webkitRelativePath?: string }).webkitRelativePath ?? "";
      const depth = p ? p.split("/").length : 1;
      return Math.max(max, depth);
    }, 0);
  }, [rows]);

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div>
        <p className={`text-sm ${th.bodyText} leading-relaxed`}>
          Stage lab artifacts before ingest: JSON manifests, Snakemake / Nextflow snippets, gzip bundles,
          zipped deliverables, NumPy arrays, QC images, and tabular exports. Everything stays in your browser
          for this demo; nothing is uploaded to a server.
        </p>
        <p className={`text-xs ${th.footNote} mt-2 font-mono`}>
          Supported paths: single files, multi-select, whole folders (relative paths preserved), drag-and-drop.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className={`${th.kpiCard} flex flex-col gap-3`}>
          <p className={`text-xs font-medium tracking-wide ${th.kpiLabel}`}>Queue</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={`${accentBtn} px-3`}
            >
              Choose files
            </button>
            <button
              type="button"
              onClick={() => folderRef.current?.click()}
              className={th.secondaryBtn}
            >
              Choose folder
            </button>
            {rows.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-2 rounded-lg border border-red-500/25 bg-red-500/5 px-3 py-2 text-xs font-medium text-red-300/90 hover:bg-red-500/10 transition-colors"
              >
                Clear queue
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            aria-label="Select files to import"
            title="Select files to import"
            onChange={(e) => {
              onFilesPicked(e.target.files);
              e.target.value = "";
            }}
          />
          <input
            ref={folderRef}
            type="file"
            multiple
            className="hidden"
            aria-label="Select folder to import"
            title="Select folder to import"
            onChange={(e) => {
              onFilesPicked(e.target.files);
              e.target.value = "";
            }}
            // @ts-expect-error: directory picker (Chromium / Safari)
            webkitdirectory=""
          />
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileRef.current?.click();
              }
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files?.length) mergeFiles(Array.from(e.dataTransfer.files));
            }}
            className={`border border-dashed px-4 py-8 text-center text-sm transition-colors ${th.importDrop(dragOver)}`}
          >
            Drop files or an entire folder here
          </div>
          {rows.length > 0 && (
            <p className={`text-sm ${th.bodyTextSoft} font-mono`}>
              {rows.length} file{rows.length === 1 ? "" : "s"}
              {folderDepth > 1 ? ` · max depth ${folderDepth} path segments` : ""}
            </p>
          )}
        </div>

        <div className={`${th.kpiCard} flex flex-col min-h-[200px]`}>
          <p className={`text-xs font-medium tracking-wide ${th.kpiLabel} mb-2`}>Classifier</p>
          <ul className={`text-xs ${th.bodyTextSoft} space-y-1.5 flex-1`}>
            <li>
              <span className={th.bodyText}>Archives:</span> .zip (entry listing), .gz / .tgz (inflate preview
              when supported)
            </li>
            <li>
              <span className={th.bodyText}>Structured:</span> .json, .jsonl, .npy header
            </li>
            <li>
              <span className={th.bodyText}>Scripts:</span> .py, .R, .sh, Snakemake, Nextflow, WDL
            </li>
            <li>
              <span className={th.bodyText}>Genomics text:</span> .csv/.tsv, .vcf, .bed, .fasta/.fq, …
            </li>
            <li>
              <span className={th.bodyText}>Media:</span> PNG, JPEG, GIF, WebP (live bitmap preview)
            </li>
          </ul>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className={`${th.dashedCard} text-sm ${th.bodyTextSoft}`}>
          No files staged yet; use the panel above to add a bundle.
        </div>
      ) : (
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-4 items-start">
          <div className={`${th.codeBlock} max-h-[min(52vh,560px)] flex flex-col`}>
            <div className={`px-3 py-2 ${th.codeBlockHead} flex items-center justify-between gap-2 shrink-0`}>
              <span className={`text-xs font-medium tracking-wide ${th.kpiLabel}`}>
                Staged files
              </span>
              <span className={`text-xs font-mono ${th.footNote}`}>{rows.length}</span>
            </div>
            <ul className={`overflow-y-auto ${th.importListDivide} text-sm`}>
              {rows.map((row) => {
                const active = selected?.id === row.id;
                const a = row.analysis;
                return (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(row.id)}
                      className={`w-full text-left px-3 py-2.5 transition-colors ${
                        active ? th.importRowActive : th.importRowHover
                      }`}
                    >
                      <p className={`font-mono text-xs ${th.strainId} truncate`} title={row.file.name}>
                        {row.file.name}
                      </p>
                      <p
                        className={`text-xs ${th.footNote} truncate mt-0.5`}
                        title={(row.file as File & { webkitRelativePath?: string }).webkitRelativePath}
                      >
                        {(row.file as File & { webkitRelativePath?: string }).webkitRelativePath ||
                          formatBytes(row.file.size)}
                      </p>
                      {row.loading && <p className="text-xs text-sky-400/90 mt-1">Analyzing…</p>}
                      {row.error && <p className="text-xs text-red-400/90 mt-1">{row.error}</p>}
                      {a && (
                        <span
                          className={`inline-flex mt-1.5 text-xs font-medium tracking-wide px-2 py-0.5 rounded border ${CATEGORY_STYLES[a.category]}`}
                        >
                          {a.category.replace(/_/g, " ")}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className={`${th.codeBlock} flex flex-col min-h-[280px] max-h-[min(52vh,560px)]`}>
            <div className={`px-3 py-2 ${th.codeBlockHead} flex items-center justify-between gap-2 shrink-0`}>
              <span className={`text-xs font-medium tracking-wide ${th.kpiLabel}`}>
                Content preview
              </span>
              {selected?.analysis && (
                <span className={`text-xs font-mono ${th.footNote} truncate`}>
                  {formatBytes(selected.analysis.size)}
                </span>
              )}
            </div>
            {!selected ? (
              <p className={`p-6 text-sm ${th.footNote}`}>Select a file to inspect the automated readout.</p>
            ) : selected.loading && !selected.error ? (
              <p className={`p-6 text-sm ${th.bodyTextSoft}`}>Running local classifier…</p>
            ) : selected.error ? (
              <p className="p-6 text-sm text-red-400/90">{selected.error}</p>
            ) : selected.analysis ? (
              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
                <div>
                  <p className={`text-xs ${th.bodyText} leading-relaxed`}>{selected.analysis.summary}</p>
                  <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm font-mono">
                    {Object.entries(selected.analysis.details).map(([k, v]) => (
                      <div key={k} className="contents">
                        <dt className={th.bodyTextSoft}>{k}</dt>
                        <dd className={`${th.strainMuted} truncate`} title={String(v)}>
                          {String(v)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
                {selected.analysis.warnings.length > 0 && (
                  <ul className="text-sm text-amber-300/90 border border-amber-500/20 rounded-lg p-3 bg-amber-500/5 space-y-1">
                    {selected.analysis.warnings.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                )}
                {selected.analysis.category === "image" && imagePreviewUrl ? (
                  <div className={th.importPreviewBox}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreviewUrl}
                      alt={`Preview of ${selected.file.name}`}
                      className="max-h-[min(38vh,360px)] w-auto object-contain"
                    />
                  </div>
                ) : null}
                {selected.analysis.previewText ? (
                  <pre className={th.importPre}>
                    {selected.analysis.previewText}
                  </pre>
                ) : selected.analysis.category === "image" ? (
                  <p className={`text-xs ${th.footNote}`}>Bitmap preview above.</p>
                ) : (
                  <p className={`text-xs ${th.footNote}`}>No text preview for this type.</p>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
