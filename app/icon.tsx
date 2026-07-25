import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Filled hexagon (same brand mark as nav/footer ⬡) via borders — reliable in OG renderer. */
function HexMark({ w, cap }: { w: number; cap: number }) {
  const half = w / 2;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: `${half}px solid transparent`,
          borderRight: `${half}px solid transparent`,
          borderBottom: `${cap}px solid #39d98a`,
        }}
      />
      <div style={{ width: w, height: w * 0.55, background: "#39d98a" }} />
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: `${half}px solid transparent`,
          borderRight: `${half}px solid transparent`,
          borderTop: `${cap}px solid #39d98a`,
        }}
      />
    </div>
  );
}

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#080d12",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <HexMark w={16} cap={5} />
      </div>
    ),
    size,
  );
}
