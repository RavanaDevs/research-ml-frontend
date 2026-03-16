import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { MODEL_DATA, FAULT_META, T } from "../../constants/data";
import KpiCard from "../ui/KpiCard";
import SectionLabel from "../ui/SectionLabel";
import Badge from "../ui/Badge";
import ChartTip from "../ui/ChartTip";

export default function OverviewTab() {
  return (
    <div style={{ animation: "fadeUp 0.3s ease" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16, marginBottom: 32 }}>
        <KpiCard label="Test Accuracy" value={MODEL_DATA.accuracy} suffix="%" color={T.accent} sub="Random Forest · 12,000 samples" />
        <KpiCard label="Weighted F1" value={MODEL_DATA.f1_weighted} color={T.green} sub="Macro-weighted across 6 classes" />
        <KpiCard label="OOB Score" value={MODEL_DATA.oob_score} color={T.textMid} sub="Out-of-bag generalisation estimate" />
        <KpiCard label="5-Fold CV Mean" value={MODEL_DATA.cv_mean} color={T.purple} sub={`σ = ${MODEL_DATA.cv_std.toFixed(4)}`} />
        <KpiCard label="Anomaly AUC-ROC" value={MODEL_DATA.anom_auc} color={T.amber} sub="Stage 1 LSTM-Autoencoder" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20 }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: 24 }}>
          <SectionLabel>Per-Class Metrics Radar</SectionLabel>
          <ResponsiveContainer width="100%" height={270}>
            <RadarChart data={MODEL_DATA.classes.map(c => ({ cls: c.short, "F1-Score": +(c.f1 * 100).toFixed(1), Precision: +(c.prec * 100).toFixed(1), Recall: +(c.rec * 100).toFixed(1) }))}>
              <PolarGrid stroke={T.border} />
              <PolarAngleAxis dataKey="cls" tick={{ fill: T.textMid, fontSize: 11, fontFamily: "'IBM Plex Mono',monospace" }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: T.textFaint, fontSize: 9 }} />
              <Radar name="F1-Score" dataKey="F1-Score" stroke={T.accent} fill={T.accent} fillOpacity={0.12} strokeWidth={2} />
              <Radar name="Precision" dataKey="Precision" stroke={T.green} fill={T.green} fillOpacity={0.07} strokeWidth={1.5} />
              <Radar name="Recall" dataKey="Recall" stroke={T.amber} fill={T.amber} fillOpacity={0.07} strokeWidth={1.5} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: "'IBM Plex Mono',monospace", color: T.textMid }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: 24 }}>
          <SectionLabel>Classification Report</SectionLabel>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                {["Fault Class", "DTC", "Precision", "Recall", "F1-Score", "Support"].map(h => (
                  <th key={h} style={{
                    padding: "8px 12px", textAlign: "left", fontWeight: 600,
                    fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: 0.8, color: T.textFaint
                  }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODEL_DATA.classes.map((c, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
                  <td style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: T.cls[i], flexShrink: 0 }} />
                    <span style={{ fontWeight: 500 }}>{FAULT_META[c.id]?.label || c.id}</span>
                  </td>
                  <td style={{ padding: "10px 12px" }}><Badge color={T.cls[i]}>{c.short === "Normal" ? "—" : c.short}</Badge></td>
                  <td style={{ padding: "10px 12px", fontFamily: "'IBM Plex Mono',monospace", color: T.textMid }}>{c.prec.toFixed(4)}</td>
                  <td style={{ padding: "10px 12px", fontFamily: "'IBM Plex Mono',monospace", color: T.textMid }}>{c.rec.toFixed(4)}</td>
                  <td style={{
                    padding: "10px 12px", fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700,
                    color: c.f1 >= 0.95 ? T.green : c.f1 >= 0.80 ? T.amber : T.red
                  }}>{c.f1.toFixed(4)}</td>
                  <td style={{ padding: "10px 12px", fontFamily: "'IBM Plex Mono',monospace", color: T.textFaint }}>{c.support.toLocaleString()}</td>
                </tr>
              ))}
              <tr style={{ borderTop: `2px solid ${T.borderDark}`, background: T.surfaceAlt }}>
                <td colSpan={2} style={{ padding: "10px 12px", fontWeight: 600, color: T.textMid, fontSize: 11 }}>Weighted Average</td>
                {[MODEL_DATA.f1_weighted, MODEL_DATA.f1_weighted, MODEL_DATA.f1_weighted].map((v, i) => (
                  <td key={i} style={{ padding: "10px 12px", fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, color: T.accent }}>{v.toFixed(4)}</td>
                ))}
                <td style={{ padding: "10px 12px", fontFamily: "'IBM Plex Mono',monospace", color: T.textFaint }}>12,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
