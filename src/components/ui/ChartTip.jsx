import { T } from "../../constants/data";

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6,
      padding: "10px 14px", fontSize: 11, fontFamily: "'IBM Plex Mono',monospace",
      boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
    }}>
      <div style={{ color: T.textFaint, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color || T.accent }}>{p.name}: <strong>{typeof p.value === "number" ? p.value.toFixed(4) : p.value}</strong></div>)}
    </div>
  );
};

export default ChartTip;
