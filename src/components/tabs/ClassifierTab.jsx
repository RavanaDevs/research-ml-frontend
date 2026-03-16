import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell
} from "recharts";
import { MODEL_DATA, T } from "../../constants/data";
import SectionLabel from "../ui/SectionLabel";
import ConfMatrix from "../ui/ConfMatrix";
import ChartTip from "../ui/ChartTip";

export default function ClassifierTab() {
  return (
    <div style={{ animation: "fadeUp 0.3s ease" }}>
      <div style={{
        background: T.surface, border: `1px solid ${T.border}`, borderLeft: `4px solid ${T.green}`,
        borderRadius: 8, padding: "20px 28px", marginBottom: 24
      }}>
        <SectionLabel>Stage 2 — Random Forest Configuration</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "8px 32px" }}>
          {[["Estimators", "200 decision trees"], ["Max depth", "15"], ["Min samples split", "4"],
          ["Class weighting", "Balanced (inverse frequency)"],
          ["Feature vector", "33-dim (14 raw + 14 delta + 5 engineered)"],
          ["Test accuracy", `${(MODEL_DATA.accuracy * 100).toFixed(2)}%`],
          ["OOB score", MODEL_DATA.oob_score.toFixed(4)], ["Random seed", "42 (fully reproducible)"]
          ].map(([k, v]) => (
            <div key={k} style={{ padding: "6px 0", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 8 }}>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: T.textFaint, minWidth: 130 }}>{k}</span>
              <span style={{ fontSize: 12, color: T.text }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, alignItems: "start" }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: 24 }}>
          <SectionLabel>Confusion Matrix · 12,000 Test Samples</SectionLabel>
          <ConfMatrix cm={MODEL_DATA.cm} classes={MODEL_DATA.classes} />
          <div style={{ display: "flex", gap: 20, marginTop: 14, fontSize: 11, fontFamily: "'IBM Plex Mono',monospace", color: T.textFaint }}>
            <span><span style={{ color: T.accent }}>■</span> Correct</span>
            <span><span style={{ color: T.red }}>■</span> Misclassified</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: 24 }}>
            <SectionLabel>F1-Score by Fault Class</SectionLabel>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={MODEL_DATA.classes.map(c => ({ name: c.short, "F1-Score": c.f1 }))} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke={T.border} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: T.textMid, fontSize: 10, fontFamily: "'IBM Plex Mono',monospace" }} />
                <YAxis domain={[0, 1.05]} tick={{ fill: T.textFaint, fontSize: 9, fontFamily: "'IBM Plex Mono',monospace" }} />
                <Tooltip content={<ChartTip />} />
                <ReferenceLine y={0.90} stroke={T.borderDark} strokeDasharray="4 3" />
                <Bar dataKey="F1-Score" radius={[3, 3, 0, 0]}>
                  {MODEL_DATA.classes.map((c, i) => <Cell key={i} fill={T.cls[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: 24 }}>
            <SectionLabel>5-Fold Cross-Validation · μ={MODEL_DATA.cv_mean.toFixed(4)} · σ={MODEL_DATA.cv_std.toFixed(4)}</SectionLabel>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={MODEL_DATA.cv_scores.map((s, i) => ({ fold: `Fold ${i + 1}`, "F1-Score": s }))} margin={{ top: 4, right: 24, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke={T.border} vertical={false} />
                <XAxis dataKey="fold" tick={{ fill: T.textMid, fontSize: 10, fontFamily: "'IBM Plex Mono',monospace" }} />
                <YAxis domain={[0.88, 0.91]} tick={{ fill: T.textFaint, fontSize: 9, fontFamily: "'IBM Plex Mono',monospace" }} />
                <Tooltip content={<ChartTip />} />
                <ReferenceLine y={MODEL_DATA.cv_mean} stroke={T.accent} strokeDasharray="4 3"
                  label={{ value: `μ=${MODEL_DATA.cv_mean.toFixed(4)}`, fill: T.accent, fontSize: 9, fontFamily: "'IBM Plex Mono',monospace", position: "right" }} />
                <Bar dataKey="F1-Score" fill={T.accent} fillOpacity={0.7} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
