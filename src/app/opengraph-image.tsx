import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Cliply — Media Downloader & Converter";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#F4EFE2",
          padding: "84px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 36 }}>
          <div
            style={{
              width: 30,
              height: 30,
              background: "#FFC629",
              border: "4px solid #1A1712",
            }}
          />
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: 6, color: "#1A1712" }}>
            CLIPLY
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 104, fontWeight: 700, lineHeight: 1.05, color: "#1A1712" }}>
          YOUR LINK.
        </div>
        <div style={{ display: "flex", fontSize: 104, fontWeight: 700, lineHeight: 1.05, color: "#1A1712" }}>
          YOUR FORMAT.
        </div>
        <div style={{ display: "flex", fontSize: 104, fontWeight: 700, lineHeight: 1.05, color: "#FFC629", WebkitTextStroke: "3px #1A1712" }}>
          DONE.
        </div>
        <div style={{ display: "flex", marginTop: 36, fontSize: 30, color: "#5C5648" }}>
          No ads. No accounts. Just downloads.
        </div>
      </div>
    ),
    { ...size },
  );
}
