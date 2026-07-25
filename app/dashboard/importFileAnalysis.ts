/** Client-side sniffing / preview for dashboard import simulator (no server upload). */

export type FileAnalysisCategory =
  | "json"
  | "text"
  | "tabular"
  | "script"
  | "image"
  | "archive_gzip"
  | "archive_zip"
  | "numpy"
  | "binary"
  | "unknown";

export type FileAnalysis = {
  id: string;
  displayPath: string;
  name: string;
  size: number;
  mime: string;
  category: FileAnalysisCategory;
  summary: string;
  details: Record<string, string | number>;
  previewText?: string;
  warnings: string[];
};

const TEXT_PREVIEW_CAP = 14_000;
const BINARY_SNIFF = 512 * 1024;
const JSON_PARSE_CAP = 1_024 * 1024;

function bytesToHex(slice: Uint8Array, max = 128): string {
  const n = Math.min(slice.length, max);
  const parts: string[] = [];
  for (let i = 0; i < n; i += 1) {
    parts.push(slice[i]!.toString(16).padStart(2, "0"));
  }
  const suffix = slice.length > max ? " …" : "";
  return parts.join(" ") + suffix;
}

function looksPrintableAscii(s: string, sampleLen = 2048): boolean {
  const t = s.slice(0, sampleLen);
  if (!t.length) return false;
  let bad = 0;
  for (let i = 0; i < t.length; i += 1) {
    const c = t.charCodeAt(i)!;
    if (c === 9 || c === 10 || c === 13) continue;
    if (c < 32 || c === 127) bad += 1;
  }
  return bad / t.length < 0.02;
}

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

function baseNameOf(pathOrName: string): string {
  const parts = pathOrName.split(/[/\\]/);
  return parts[parts.length - 1] ?? pathOrName;
}

function stripGzipExt(name: string): string {
  return name.toLowerCase().endsWith(".gz") ? name.slice(0, -3) : name;
}

/** Walk local file headers; assumes conventional ZIP (demo). */
function listZipEntries(buffer: ArrayBuffer): { name: string; compressed: number; uncompressed: number }[] {
  const view = new DataView(buffer);
  const entries: { name: string; compressed: number; uncompressed: number }[] = [];
  let offset = 0;
  const len = buffer.byteLength;
  while (offset + 30 <= len) {
    const sig = view.getUint32(offset, true);
    if (sig !== 0x04034b50) break;
    const comp = view.getUint32(offset + 18, true);
    const uncomp = view.getUint32(offset + 22, true);
    const nameLen = view.getUint16(offset + 26, true);
    const extraLen = view.getUint16(offset + 28, true);
    if (offset + 30 + nameLen > len) break;
    const nameBytes = new Uint8Array(buffer, offset + 30, nameLen);
    const name = new TextDecoder("utf-8", { fatal: false }).decode(nameBytes);
    entries.push({ name, compressed: comp, uncompressed: uncomp });
    const next = offset + 30 + nameLen + extraLen + comp;
    if (next <= offset) break;
    offset = next;
  }
  return entries;
}

async function gunzipToUint8(buf: ArrayBuffer): Promise<Uint8Array | null> {
  try {
    const stream = new Response(buf).body;
    if (!stream) return null;
    const ds = new DecompressionStream("gzip");
    const out = stream.pipeThrough(ds);
    const ab = await new Response(out).arrayBuffer();
    return new Uint8Array(ab);
  } catch {
    return null;
  }
}

function countLines(s: string): number {
  let n = 0;
  for (let i = 0; i < s.length; i += 1) if (s.charCodeAt(i) === 10) n += 1;
  return n + (s.length && !s.endsWith("\n") ? 1 : 0);
}

function jsonShape(value: unknown): { kind: string; detail: string } {
  if (value === null) return { kind: "null", detail: "" };
  const t = typeof value;
  if (t === "number" || t === "string" || t === "boolean") return { kind: t, detail: String(value).slice(0, 80) };
  if (Array.isArray(value)) {
    const inner = value.length ? jsonShape(value[0]!) : { kind: "empty", detail: "" };
    return { kind: "array", detail: `length ${value.length}; first: ${inner.kind}` };
  }
  if (t === "object") {
    const keys = Object.keys(value as object);
    return { kind: "object", detail: `${keys.length} keys` };
  }
  return { kind: "unknown", detail: "" };
}

let idSeq = 0;
function nextId(): string {
  idSeq += 1;
  return `imp-${idSeq}`;
}

export async function analyzeFile(file: File): Promise<FileAnalysis> {
  const warnings: string[] = [];
  const displayPath = (file as File & { webkitRelativePath?: string }).webkitRelativePath?.trim() || file.name;
  const ext = extOf(file.name);
  const baseLower = baseNameOf(file.name).toLowerCase();
  const base = stripGzipExt(file.name);
  const innerExt = extOf(base);

  const head = new Uint8Array(await file.slice(0, Math.min(BINARY_SNIFF, file.size)).arrayBuffer());
  const head0 = head[0];
  const head1 = head[1];

  const details: Record<string, string | number> = {
    bytes: file.size,
    extension: ext || "–",
  };

  const isGzipMagic = head0 === 0x1f && head1 === 0x8b;
  const isZipMagic = head0 === 0x50 && head1 === 0x4b && head[2] === 0x03 && head[3] === 0x04;

  // ── ZIP (folder drops often include zips) ──
  if (isZipMagic || ext === "zip") {
    const buf = file.size <= 32 * 1024 * 1024 ? await file.arrayBuffer() : await file.slice(0, 32 * 1024 * 1024).arrayBuffer();
    let entries: ReturnType<typeof listZipEntries> = [];
    try {
      entries = listZipEntries(buf);
    } catch {
      warnings.push("ZIP structure parse failed; showing raw header only.");
    }
    if (file.size > 32 * 1024 * 1024) warnings.push("ZIP truncated at 32 MB for demo parse.");
    const names = entries.slice(0, 200).map((e) => e.name);
    const previewText =
      entries.length === 0
        ? "Could not list ZIP entries (non-standard layout or empty)."
        : `Entries (${entries.length}${entries.length > 200 ? ", showing first 200" : ""}):\n${names.join("\n")}`;
    return {
      id: nextId(),
      displayPath,
      name: file.name,
      size: file.size,
      mime: file.type || "application/zip",
      category: "archive_zip",
      summary: `ZIP archive · ${entries.length} local header(s) detected`,
      details: {
        ...details,
        entries: entries.length,
        uncompressedSum: entries.reduce((a, e) => a + e.uncompressed, 0),
      },
      previewText,
      warnings,
    };
  }

  // ── GZIP ──
  if (isGzipMagic || ext === "gz" || ext === "tgz") {
    const raw = await file.arrayBuffer();
    let innerNote = "gzip";
    let previewText: string | undefined;
    if (raw.byteLength > 48 * 1024 * 1024) {
      warnings.push("File larger than 48 MB; gzip preview skipped.");
    } else {
      const inflated = await gunzipToUint8(raw);
      if (!inflated) {
        warnings.push("Browser could not inflate gzip (try a smaller file).");
      } else {
        innerNote = `gzip → ${inflated.byteLength} bytes inflated`;
        const td = new TextDecoder("utf-8", { fatal: false });
        const asText = td.decode(inflated.slice(0, TEXT_PREVIEW_CAP));
        if (looksPrintableAscii(asText) && innerExt === "json") {
          try {
            const parsed = JSON.parse(asText.slice(0, JSON_PARSE_CAP));
            const shape = jsonShape(parsed);
            previewText = `Inner JSON (${shape.kind}): ${shape.detail}\n\n${JSON.stringify(parsed, null, 2).slice(0, TEXT_PREVIEW_CAP)}`;
          } catch {
            previewText = asText;
          }
        } else if (looksPrintableAscii(asText)) {
          previewText = asText;
        } else {
          previewText = `Binary after inflate (${inflated.byteLength} bytes)\nhex: ${bytesToHex(inflated.slice(0, 64))}`;
        }
      }
    }
    return {
      id: nextId(),
      displayPath,
      name: file.name,
      size: file.size,
      mime: file.type || "application/gzip",
      category: "archive_gzip",
      summary: `Gzip container · ${innerNote}`,
      details: { ...details, innerName: base },
      previewText,
      warnings,
    };
  }

  // ── NumPy .npy (magic \\x93 "NUMPY") ──
  const isNpyMagic =
    head[0] === 0x93 &&
    head[1] === 0x4e &&
    head[2] === 0x55 &&
    head[3] === 0x4d &&
    head[4] === 0x50 &&
    head[5] === 0x59;
  if (ext === "npy" || isNpyMagic) {
    const buf = await file.slice(0, Math.min(file.size, 256 * 1024)).arrayBuffer();
    const u = new Uint8Array(buf);
    const magic = String.fromCharCode(u[0]!, u[1]!, u[2]!, u[3]!, u[4]!, u[5]!);
    const major = u[6];
    const minor = u[7];
    const headerLen = new DataView(buf).getUint16(8, true);
    const headerText = new TextDecoder().decode(u.slice(10, 10 + headerLen));
    return {
      id: nextId(),
      displayPath,
      name: file.name,
      size: file.size,
      mime: file.type || "application/octet-stream",
      category: "numpy",
      summary: `NumPy array file · v${major}.${minor}`,
      details: { ...details, magic, headerChars: headerLen },
      previewText: headerText.trim().slice(0, TEXT_PREVIEW_CAP),
      warnings,
    };
  }

  // ── Images ──
  const imageMime =
    (head[0] === 0xff && head[1] === 0xd8 && "image/jpeg") ||
    (head[0] === 0x89 && head[1] === 0x50 && "image/png") ||
    (head[0] === 0x47 && head[1] === 0x49 && "image/gif") ||
    (head[0] === 0x42 && head[1] === 0x4d && "image/bmp") ||
    (head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46 && "image/webp") ||
    (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext) && (file.type || `image/${ext === "jpg" ? "jpeg" : ext}`)) ||
    "";
  if (imageMime) {
    return {
      id: nextId(),
      displayPath,
      name: file.name,
      size: file.size,
      mime: file.type || imageMime,
      category: "image",
      summary: `Raster / image asset · ${imageMime}`,
      details: { ...details, sniffed: imageMime },
      warnings,
    };
  }

  // ── JSON ──
  if (ext === "json" || ext === "jsonl" || ext === "ndjson") {
    const slice = await file.slice(0, Math.min(file.size, JSON_PARSE_CAP)).text();
    if (ext === "jsonl" || ext === "ndjson") {
      const lines = slice.split("\n").filter(Boolean).slice(0, 12);
      let parsedFirst: unknown;
      try {
        parsedFirst = lines[0] ? JSON.parse(lines[0]!) : null;
      } catch {
        parsedFirst = null;
      }
      const shape = parsedFirst != null ? jsonShape(parsedFirst) : { kind: "?", detail: "" };
      return {
        id: nextId(),
        displayPath,
        name: file.name,
        size: file.size,
        mime: file.type || "application/x-ndjson",
        category: "json",
        summary: `NDJSON / JSON lines · first row ${shape.kind}`,
        details: { ...details, linesSampled: lines.length },
        previewText: lines.join("\n").slice(0, TEXT_PREVIEW_CAP),
        warnings,
      };
    }
    try {
      const parsed = JSON.parse(slice);
      const shape = jsonShape(parsed);
      return {
        id: nextId(),
        displayPath,
        name: file.name,
        size: file.size,
        mime: file.type || "application/json",
        category: "json",
        summary: `JSON · ${shape.kind}: ${shape.detail}`,
        details: { ...details, parse: "ok" },
        previewText: JSON.stringify(parsed, null, 2).slice(0, TEXT_PREVIEW_CAP),
        warnings,
      };
    } catch (e) {
      warnings.push(`JSON parse error: ${e instanceof Error ? e.message : String(e)}`);
      return {
        id: nextId(),
        displayPath,
        name: file.name,
        size: file.size,
        mime: file.type || "application/json",
        category: "json",
        summary: "JSON (invalid or truncated in preview window)",
        details: { ...details, parse: "fail" },
        previewText: slice.slice(0, TEXT_PREVIEW_CAP),
        warnings,
      };
    }
  }

  // ── Scripts ──
  const scriptExt =
    ext === "py" ||
    ext === "r" ||
    ext === "sh" ||
    ext === "snakefile" ||
    ext === "nf" ||
    ext === "wdl" ||
    baseLower === "snakefile";
  if (scriptExt || ext === "sql" || ext === "ps1") {
    const text = await file.slice(0, Math.min(file.size, JSON_PARSE_CAP)).text();
    const lines = countLines(text);
    return {
      id: nextId(),
      displayPath,
      name: file.name,
      size: file.size,
      mime: file.type || "text/plain",
      category: "script",
      summary: `Script / workflow source · ~${lines} lines in preview window`,
      details: { ...details, language: ext || baseLower || "text" },
      previewText: text.slice(0, TEXT_PREVIEW_CAP),
      warnings,
    };
  }

  // ── Tabular / FASTA ──
  if (["csv", "tsv", "bed", "gtf", "gff", "gff3", "vcf", "sam", "fa", "fasta", "fq", "fastq"].includes(ext)) {
    const text = await file.slice(0, Math.min(file.size, JSON_PARSE_CAP)).text();
    const lines = countLines(text);
    let summary = `Textual genomics/table · ~${lines} lines (preview cap)`;
    if (ext === "csv" || ext === "tsv") {
      const delim = ext === "tsv" ? "\t" : ",";
      const header = text.split(/\r?\n/)[0] ?? "";
      const cols = header.split(delim).length;
      summary = `Delimited table · ~${cols} columns on first row`;
      details.columns = cols;
    }
    if (ext === "fa" || ext === "fasta" || ext === "fq" || ext === "fastq") {
      const n = (text.match(/^>/gm) ?? []).length;
      summary = `Sequence records · ~${n} headers (>) in preview`;
      details.headersInPreview = n;
    }
    return {
      id: nextId(),
      displayPath,
      name: file.name,
      size: file.size,
      mime: file.type || "text/plain",
      category: "tabular",
      summary,
      details: { ...details, linesInPreview: lines },
      previewText: text.slice(0, TEXT_PREVIEW_CAP),
      warnings,
    };
  }

  // ── Plain text fallback ──
  if (
    file.type.startsWith("text/") ||
    ["md", "txt", "log", "yaml", "yml", "toml", "ini", "xml", "html", "svg", "ts", "tsx", "js", "mjs", "cjs"].includes(
      ext,
    )
  ) {
    const text = await file.slice(0, Math.min(file.size, JSON_PARSE_CAP)).text();
    const lines = countLines(text);
    return {
      id: nextId(),
      displayPath,
      name: file.name,
      size: file.size,
      mime: file.type || "text/plain",
      category: "text",
      summary: `Text · ~${lines} lines in preview window`,
      details: { ...details, linesInPreview: lines },
      previewText: text.slice(0, TEXT_PREVIEW_CAP),
      warnings,
    };
  }

  // ── Generic binary ──
  const printable = await file.slice(0, Math.min(16 * 1024, file.size)).text();
  if (looksPrintableAscii(printable)) {
    return {
      id: nextId(),
      displayPath,
      name: file.name,
      size: file.size,
      mime: file.type || "text/plain",
      category: "text",
      summary: "Ambiguous extension; treated as UTF-8 text",
      details,
      previewText: printable.slice(0, TEXT_PREVIEW_CAP),
      warnings,
    };
  }

  return {
    id: nextId(),
    displayPath,
    name: file.name,
    size: file.size,
    mime: file.type || "application/octet-stream",
    category: "binary",
    summary: "Binary blob; magic not recognised in demo classifier",
    details: { ...details, hex: bytesToHex(head, 96) },
    previewText: `First bytes (hex):\n${bytesToHex(head, 256)}`,
    warnings,
  };
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(2)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
