import { T } from "../../constants/data";
import AnimNum from "./AnimNum";

export default function KpiCard({ label, value, decimals = 4, suffix = "", sub, color = T.accent }) {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8,
      padding: "20px 24px", flex: "1 1 140px", borderTop: `3px solid ${color}`
    }}>
      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: 1.6, color: T.textFaint, marginBottom: 10 }}>{label}</div>
      <div style={{ fontFamily: "'IBM Plex Serif',Georgia,serif", fontSize: 28, fontWeight: 600, color, lineHeight: 1 }}>
        <AnimNum value={suffix === "%" ? value * 100 : value} decimals={suffix === "%" ? 2 : decimals} />{suffix && <span style={{ fontSize: 14, color: T.textMid, marginLeft: 2 }}>{suffix}</span>}
      </div>
      {sub && <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: T.textFaint, marginTop: 8 }}>{sub}</div>}
    </div>
  );
}
