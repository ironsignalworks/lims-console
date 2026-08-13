import { describe, expect, it } from "vitest";
import { analyzeFile, formatBytes } from "@/app/dashboard/importFileAnalysis";

describe("formatBytes", () => {
  it("formats bytes, KB, and MB", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2048)).toBe("2.0 KB");
    expect(formatBytes(2 * 1024 * 1024)).toBe("2.00 MB");
  });
});

describe("analyzeFile", () => {
  it("classifies JSON and previews structure", async () => {
    const file = new File([JSON.stringify({ strain: "YG-2841", ok: true }, null, 2)], "sample.json", {
      type: "application/json",
    });
    const result = await analyzeFile(file);
    expect(result.category).toBe("json");
    expect(result.name).toBe("sample.json");
    expect(result.previewText).toContain("YG-2841");
    expect(result.warnings).toEqual([]);
  });

  it("classifies tabular CSV", async () => {
    const csv = "id,status\nYG-1,complete\nYG-2,running\n";
    const file = new File([csv], "strains.csv", { type: "text/csv" });
    const result = await analyzeFile(file);
    expect(result.category).toBe("tabular");
    expect(result.previewText).toContain("YG-1");
  });

  it("classifies plain text", async () => {
    const file = new File(["hello lims\n"], "notes.txt", { type: "text/plain" });
    const result = await analyzeFile(file);
    expect(result.category).toBe("text");
    expect(result.summary.length).toBeGreaterThan(0);
  });
});
