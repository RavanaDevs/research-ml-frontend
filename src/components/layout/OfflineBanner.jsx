import { T } from "../../constants/data";

export default function OfflineBanner() {
  return (
    <div style={{
      background: T.redLt, borderBottom: `1px solid ${T.red}30`,
      padding: "10px 40px", display: "flex", alignItems: "center", gap: 10
    }}>
      <span style={{ color: T.red, fontSize: 12, fontFamily: "'IBM Plex Mono',monospace" }}>
        ⚠ Backend offline — make sure FastAPI is running:
      </span>
      <code style={{
        background: "#fff", border: `1px solid ${T.border}`, borderRadius: 4,
        padding: "2px 10px", fontSize: 11, color: T.text
      }}>
        uvicorn app:app --reload --port 8000
      </code>
      <span style={{ color: T.red, fontSize: 11, marginLeft: 4 }}>
        The simulator will use real model inference once the API is online.
      </span>
    </div>
  );
}
