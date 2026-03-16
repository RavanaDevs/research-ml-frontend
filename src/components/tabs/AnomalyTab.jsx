import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Legend
} from "recharts";
import { MODEL_DATA, T } from "../../constants/data";
import KpiCard from "../ui/KpiCard";
import SectionLabel from "../ui/SectionLabel";
import ChartTip from "../ui/ChartTip";

export default function AnomalyTab({ apiThreshold }) {
  return (
    <div style={{ animation: "fadeUp 0.3s ease" }}>
      <div style={{
        background: T.surface, border: `1px solid ${T.border}`, borderLeft: `4px solid ${T.purple}`,
        borderRadius: 8, padding: "20px 28px", marginBottom: 24
      }}>
        <SectionLabel>Stage 1 — LSTM-Autoencoder Architecture</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "8px 32px" }}>
          {[["Encoder", "LSTM(128) → LSTM(64) → Latent(32)"], ["Decoder", "LSTM(64) → LSTM(128) → Reconstruction"],
          ["Input", "60 timesteps × 14 OBD-II features"], ["Training", "Reconstruction on Normal class only"],
          ["Loss", "Mean Squared Error (MSE)"], ["Threshold", "μ + 3σ of validation reconstruction error"],
          ["Threshold value", `${apiThreshold.toFixed(4)} (normalised)`], ["Optimiser", "Adam · lr = 0.001 · batch = 32"]
          ].map(([k, v]) => (
            <div key={k} style={{ padding: "6px 0", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 8 }}>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: T.textFaint, minWidth: 130 }}>{k}</span>
              <span style={{ fontSize: 12, color: T.text }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        <KpiCard label="AUC-ROC" value={MODEL_DATA.anom_auc} color={T.accent} sub="Stage 1 discrimination" />
        <KpiCard label="Precision" value={MODEL_DATA.anom_precision} color={T.green} sub="True positive rate" />
        <KpiCard label="Recall" value={MODEL_DATA.anom_recall} color={T.red} sub="Conservative threshold (μ+3σ)" />
        <KpiCard label="F1-Score" value={MODEL_DATA.anom_f1} color={T.amber} sub="Harmonic mean" />
      </div>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: 24 }}>
        <SectionLabel>Reconstruction Error Distribution</SectionLabel>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={(() => {
            const bins = Array.from({ length: 50 }, (_, i) => ({ bin: (i * 0.04).toFixed(2), normal: 0, fault: 0 }));
            for (let i = 0; i < 500; i++) { const v = Math.abs(Math.random() * 0.10 + 0.16 + (Math.random() - 0.5) * 0.07); bins[Math.min(49, Math.floor(v / 0.04))].normal++; }
            for (let i = 0; i < 500; i++) { const v = Math.abs(Math.random() * 0.18 + 0.60 + (Math.random() - 0.5) * 0.12); bins[Math.min(49, Math.floor(v / 0.04))].fault++; }
            return bins;
          })()}>
            <CartesianGrid strokeDasharray="4 4" stroke={T.border} vertical={false} />
            <XAxis dataKey="bin" tick={{ fill: T.textFaint, fontSize: 9, fontFamily: "'IBM Plex Mono',monospace" }} interval={4}
              label={{ value: "Reconstruction Error (Anomaly Score)", fill: T.textFaint, fontSize: 10, position: "insideBottom", offset: -5 }} />
            <YAxis tick={{ fill: T.textFaint, fontSize: 9, fontFamily: "'IBM Plex Mono',monospace" }} />
            <Tooltip content={<ChartTip />} />
            <ReferenceLine x="0.52" stroke={T.amber} strokeWidth={2} strokeDasharray="6 3"
              label={{ value: "Threshold", fill: T.amber, fontSize: 10, fontFamily: "'IBM Plex Mono',monospace" }} />
            <Bar dataKey="normal" fill={T.accent} fillOpacity={0.6} name="Normal" />
            <Bar dataKey="fault" fill={T.red} fillOpacity={0.55} name="Fault" />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: "'IBM Plex Mono',monospace", color: T.textMid }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
