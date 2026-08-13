import { describe, expect, it } from "vitest";
import {
  DEMO_Q30_SERIES,
  buildLimsVisualizationRScript,
  buildRCodeFromImportedTextFile,
} from "@/app/dashboard/limsRVisualizationExport";

describe("buildLimsVisualizationRScript", () => {
  it("emits a self-contained ggplot2 script from demo rows", () => {
    const script = buildLimsVisualizationRScript({
      strains: [
        { status: "complete" },
        { status: "complete" },
        { status: "running" },
        { status: "qc_hold" },
      ],
      runs: [
        { id: "RUN-1", files: 8, state: "ok" },
        { id: "RUN-2", files: 4, state: "active" },
      ],
      dataNote: "unit test",
    });

    expect(script).toContain("library(ggplot2)");
    expect(script).toContain("unit test");
    expect(script).toContain("RUN-1");
    expect(script).toContain("ggsave");
    expect(script).toContain(DEMO_Q30_SERIES[0]!.toFixed(6));
    // status counts: 2 complete, 1 running, 1 qc_hold
    expect(script).toContain("n = c(2L, 1L, 1L)");
  });
});

describe("buildRCodeFromImportedTextFile", () => {
  it("wraps UTF-8 lines as an R character vector", () => {
    const code = buildRCodeFromImportedTextFile("plate_map.tsv", "well\tstrain\nA01\tYG-1\n");
    expect(code).toContain('dest_file <- "plate_map.tsv"');
    expect(code).toContain("lines_vec <- c(");
    expect(code).toContain("writeLines");
    expect(code).toContain("A01");
  });

  it("sanitizes unsafe basenames", () => {
    const code = buildRCodeFromImportedTextFile("../weird name!!.txt", "x");
    expect(code).toContain('dest_file <- "weird_name_.txt"');
  });
});
