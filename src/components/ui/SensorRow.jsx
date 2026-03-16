import { T } from "../../constants/data";

export default function SensorRow({ label, value, min, max, unit, alert }) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: `1px solid ${T.border}` }}>
      <div style={{ width: 110, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: T.textMid }}>{label}</div>
      <div style={{ flex: 1, background: T.surfaceAlt, borderRadius: 3, height: 5, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 3, background: alert ? T.red : T.accent, transition: "width 0.4s" }} />
      </div>
      <div style={{ width: 88, textAlign: "right", fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, fontWeight: 600, color: alert ? T.red : T.text }}>
        {typeof value === "number" ? value.toFixed(value > 100 ? 0 : 2) : value}
        <span style={{ fontSize: 10, color: T.textFaint, marginLeft: 3, fontWeight: 400 }}>{unit}</span>
      </div>
    </div>
  );
}
