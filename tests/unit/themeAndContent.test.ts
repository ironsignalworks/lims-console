import { describe, expect, it } from "vitest";
import { dashboardTokens, drawerTokens, strainStatusStyles } from "@/app/dashboard/dashboardTheme";
import { FAQ_INTRO, FAQ_SECTIONS } from "@/app/dashboard/faqContent";
import { LAB_TITLE_LINE, LAB_NOVA_FCT_LINE } from "@/app/labIdentity";

describe("dashboardTokens", () => {
  it("returns light and dark surface classes", () => {
    const light = dashboardTokens(true);
    const dark = dashboardTokens(false);

    expect(light.shell).toContain("bg-[#f1f4f8]");
    expect(dark.shell).toContain("bg-[#1a2332]");
    expect(dark.kpiLabel).toContain("text-slate-300");
    expect(light.navActive).toContain("text-[#0d7377]");
    expect(dark.navActive).toContain("text-[#5eead4]");
  });
});

describe("drawerTokens / strainStatusStyles", () => {
  it("keeps drawer and status badges theme-aware", () => {
    expect(drawerTokens(true).title).toContain("text-slate-900");
    expect(drawerTokens(false).title).toContain("text-slate-50");
    expect(strainStatusStyles(true).complete.label).toBe("Indexed");
    expect(strainStatusStyles(false).qc_hold.className).toContain("amber");
  });
});

describe("faqContent", () => {
  it("exposes intro and at least one section with Q&A", () => {
    expect(FAQ_INTRO.toLowerCase()).toContain("lims");
    expect(FAQ_SECTIONS.length).toBeGreaterThanOrEqual(2);
    for (const section of FAQ_SECTIONS) {
      expect(section.items.length).toBeGreaterThan(0);
      expect(section.items[0]!.q.length).toBeGreaterThan(5);
    }
  });
});

describe("labIdentity", () => {
  it("keeps demo branding lines non-empty", () => {
    expect(LAB_TITLE_LINE).toBe("YeastGenomics Lab");
    expect(LAB_NOVA_FCT_LINE).toBe("NOVA FCT");
  });
});
