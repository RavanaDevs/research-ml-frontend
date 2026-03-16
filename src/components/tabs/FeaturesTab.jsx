import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { MODEL_DATA, T } from "../../constants/data";
import SectionLabel from "../ui/SectionLabel";
import Badge from "../ui/Badge";
import ChartTip from "../ui/ChartTip";

export default function FeaturesTab() {
  return (
    <div style={{ animation: "fadeUp 0.3s ease" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: 24 }}>
          <SectionLabel>Top 10 Feature Importances — Gini Impurity</SectionLabel>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[...MODEL_DATA.features].reverse()} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 16 }}>
              <CartesianGrid strokeDasharray="4 4" stroke={T.border} horizontal={false} />
              <XAxis type="number" tick={{ fill: T.textFaint, fontSize: 9, fontFamily: "'IBM Plex Mono',monospace" }}
                label={{ value: "Gini Importance", fill: T.textFaint, fontSize: 10, position: "insideBottom", offset: -5 }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fill: T.textMid, fontSize: 10, fontFamily: "'IBM Plex Mono',monospace" }} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="imp" radius={[0, 4, 4, 0]} name="Importance">
                {[...MODEL_DATA.features].reverse().map((f, i) => <Cell key={i} fill={f.type === "raw" ? T.accent : T.purple} fillOpacity={0.75} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 20, marginTop: 12, fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: T.textMid }}>
            <span><span style={{ color: T.accent }}>■</span> Raw OBD-II</span>
            <span><span style={{ color: T.purple }}>■</span> Engineered</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { title: "Engineered Feature Contribution", value: "27.81%", note: "4 of top 10 features are derived metrics", color: T.purple },
            { title: "P0128 Key Feature", value: "coolant_temp", note: "Gini importance 0.1566 — highest ranked", color: T.accent },
            { title: "P0171 Feature Cluster", value: "ltft + total_ftrim + lambda_dev", note: "37.84% of total importance combined", color: T.green },
            { title: "P0420 Feature Pair", value: "o2_sensor_b1s2 + o2_ratio", note: "14.65% of total importance combined", color: T.amber },
            { title: "P0300 Weakest Signal", value: "engine_load + rpm_load_ratio", note: "Only 2.0% — motivates CAN bus integration", color: T.red },
          ].map((item, i) => (
            <div key={i} style={{
              background: T.surface, border: `1px solid ${T.border}`,
              borderLeft: `3px solid ${item.color}`, borderRadius: 8, padding: "14px 18px"
            }}>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: 1.2, color: T.textFaint, marginBottom: 4 }}>{item.title.toUpperCase()}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: item.color, marginBottom: 4, fontFamily: "'IBM Plex Mono',monospace" }}>{item.value}</div>
              <div style={{ fontSize: 11, color: T.textMid }}>{item.note}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: 24 }}>
        <SectionLabel>Feature → DTC Diagnostic Mapping</SectionLabel>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${T.border}` }}>
              {["OBD-II Feature", "Type", "Diagnostic Role", "Key for DTC", "Direction"].map(h => (
                <th key={h} style={{
                  padding: "8px 12px", textAlign: "left", fontWeight: 600,
                  fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: 0.8, color: T.textFaint
                }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["coolant_temp", "raw", "Thermostat monitoring", "P0128", "↓ below 80 °C"],
              ["ltft_b1", "raw", "Long-term fuel adaptation", "P0171", "↑ > +25%"],
              ["total_ftrim", "eng", "Composite fuel correction (STFT+LTFT)", "P0171", "↑ > +25%"],
              ["lambda_dev", "eng", "AFR deviation from stoichiometry", "P0171", "↑ lean"],
              ["lambda", "raw", "Real-time air-fuel ratio", "P0301/P0171", "↑ lean  ↓ rich"],
              ["o2_sensor_b1s2", "raw", "Downstream catalyst monitor", "P0420", "↑ oscillating"],
              ["o2_ratio", "eng", "Upstream/downstream O₂ switch ratio", "P0420", "→ 1.0 (degraded)"],
              ["o2_sensor_b1s1", "raw", "Closed-loop fuel control signal", "P0171/P0300", "↑ lean"],
              ["stft_b1", "raw", "Short-term fuel trim correction", "P0171", "↑ maxed"],
              ["d_coolant_temp", "eng", "Coolant temperature rate of rise", "P0128", "↓ slow warm-up"],
            ].map(([feat, type, role, dtc, dir], i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${T.border}`, background: i % 2 === 0 ? T.surface : T.surfaceAlt }}>
                <td style={{ padding: "9px 12px", fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, fontWeight: 600 }}>{feat}</td>
                <td style={{ padding: "9px 12px" }}><Badge color={type === "raw" ? T.accent : T.purple}>{type}</Badge></td>
                <td style={{ padding: "9px 12px", color: T.textMid }}>{role}</td>
                <td style={{ padding: "9px 12px" }}>{dtc.split("/").map(d => <Badge key={d} color={T.textMid}>{d}</Badge>)}</td>
                <td style={{ padding: "9px 12px", fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: T.textFaint }}>{dir}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
