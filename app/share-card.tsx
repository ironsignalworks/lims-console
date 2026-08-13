import { ImageResponse } from "next/og";
import { LAB_NOVA_FCT_LINE, LAB_TITLE_LINE } from "./labIdentity";

/** Standard OG / Twitter large-card size (Facebook, LinkedIn, Slack, Discord, X). */
export const shareCardSize = { width: 1200, height: 630 };

export const shareCardAlt =
  "LIMS Console — interactive yeast genomics lab demo by YeastGenomics Lab · NOVA FCT";

export const shareCardContentType = "image/png";

/** One share card used for Open Graph and Twitter/X. */
export function ShareCardImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(145deg, #f1f4f8 0%, #e4ebf3 55%, #d7e4ea 100%)",
          color: "#0f172a",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                background: "#0d7377",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: "#0d7377",
                letterSpacing: "0.02em",
              }}
            >
              {LAB_TITLE_LINE}
            </div>
            <div style={{ fontSize: 16, color: "#64748b" }}>{LAB_NOVA_FCT_LINE}</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            maxWidth: 900,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "#0f172a",
            }}
          >
            LIMS Console
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.35,
              color: "#475569",
              maxWidth: 820,
            }}
          >
            Strain registry, pipeline scenarios, and lab ops — interactive demo for yeast
            genomics workflows.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          {["Strain registry", "Pipeline runs", "Mermaid scenarios"].map((label) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 18px",
                borderRadius: 999,
                background: "rgba(13, 115, 119, 0.10)",
                border: "1px solid rgba(13, 115, 119, 0.22)",
                color: "#0d7377",
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...shareCardSize },
  );
}
