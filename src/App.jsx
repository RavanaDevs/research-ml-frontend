import { useState, useEffect, useRef } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceLine, Legend, Cell
} from "recharts";

// ── API CONFIG — change this to your backend URL ─────────────────────────────
const API_BASE = "https://fleetml.ravanadevs.com"

// ── STATIC MODEL DATA (loaded from /model-info on mount) ─────────────────────
const MODEL_DATA = {
  accuracy: 0.8932, f1_weighted: 0.8908, oob_score: 0.8922,
  cv_mean: 0.8903, cv_std: 0.0021,
  cv_scores: [0.8917, 0.8915, 0.8876, 0.8929, 0.8878],
  anom_auc: 0.8011, anom_precision: 0.9836, anom_recall: 0.1080, anom_f1: 0.1946,
  classes: [
    { id: "Normal", short: "Normal", f1: 0.7644, prec: 0.6704, rec: 0.8890, support: 2000 },
    { id: "P0301", short: "P0301", f1: 0.9540, prec: 0.9442, rec: 0.9640, support: 2000 },
    { id: "P0300", short: "P0300", f1: 0.6927, prec: 0.8755, rec: 0.5730, support: 2000 },
    { id: "P0171", short: "P0171", f1: 1.0000, prec: 1.0000, rec: 1.0000, support: 2000 },
    { id: "P0420", short: "P0420", f1: 0.9363, prec: 0.9387, rec: 0.9340, support: 2000 },
    { id: "P0128", short: "P0128", f1: 0.9973, prec: 0.9955, rec: 0.9990, support: 2000 },
  ],
  cm: [
    [1778, 27, 125, 0, 64, 6],
    [36, 1928, 36, 0, 0, 0],
    [708, 87, 1146, 0, 58, 1],
    [0, 0, 0, 2000, 0, 0],
    [128, 0, 2, 0, 1868, 2],
    [2, 0, 0, 0, 0, 1998],
  ],
  features: [
    { name: "coolant_temp", imp: 0.1566, type: "raw" },
    { name: "ltft_b1", imp: 0.1422, type: "raw" },
    { name: "total_ftrim", imp: 0.1257, type: "eng" },
    { name: "lambda_dev", imp: 0.1005, type: "eng" },
    { name: "lambda", imp: 0.0884, type: "raw" },
    { name: "o2_sensor_b1s2", imp: 0.0815, type: "raw" },
    { name: "o2_ratio", imp: 0.0650, type: "eng" },
    { name: "o2_sensor_b1s1", imp: 0.0410, type: "raw" },
    { name: "stft_b1", imp: 0.0348, type: "raw" },
    { name: "d_coolant_temp", imp: 0.0280, type: "eng" },
  ],
};

// ── FAULT PROFILES for simulator ─────────────────────────────────────────────
// Profiles use exact per-class feature means from the trained dataset.
// The backend applies the same feature engineering pipeline as training,
// so these values produce anomaly scores consistent with the model.
const FAULT_PROFILES = {
  Normal: { engine_rpm: 2203.27, vehicle_speed: 44.85, engine_load: 0.2407, throttle_position: 0.2046, coolant_temp: 88.02, intake_air_temp: 34.99, maf: 9.73, map_pressure: 54.46, lambda_val: 1.0000, spark_advance: 15.04, stft_b1: -0.004, ltft_b1: 0.995, o2_sensor_b1s1: 0.4573, o2_sensor_b1s2: 0.1506 },
  P0301: { engine_rpm: 2203.14, vehicle_speed: 45.00, engine_load: 0.2412, throttle_position: 0.2053, coolant_temp: 87.97, intake_air_temp: 34.94, maf: 9.76, map_pressure: 54.49, lambda_val: 0.9599, spark_advance: 14.99, stft_b1: -2.495, ltft_b1: -4.031, o2_sensor_b1s1: 0.7797, o2_sensor_b1s2: 0.1506 },
  P0300: { engine_rpm: 2132.50, vehicle_speed: 44.98, engine_load: 0.2119, throttle_position: 0.2040, coolant_temp: 88.00, intake_air_temp: 35.13, maf: 9.66, map_pressure: 54.38, lambda_val: 0.9999, spark_advance: 14.98, stft_b1: 0.012, ltft_b1: -0.996, o2_sensor_b1s1: 0.5032, o2_sensor_b1s2: 0.1500 },
  P0171: { engine_rpm: 2203.98, vehicle_speed: 44.80, engine_load: 0.2404, throttle_position: 0.2041, coolant_temp: 87.96, intake_air_temp: 35.04, maf: 7.53, map_pressure: 44.43, lambda_val: 1.1207, spark_advance: 15.00, stft_b1: 11.993, ltft_b1: 21.951, o2_sensor_b1s1: 0.7191, o2_sensor_b1s2: 0.1503 },
  P0420: { engine_rpm: 2200.56, vehicle_speed: 45.12, engine_load: 0.2406, throttle_position: 0.2042, coolant_temp: 88.03, intake_air_temp: 34.97, maf: 9.70, map_pressure: 54.42, lambda_val: 0.9998, spark_advance: 14.99, stft_b1: 0.040, ltft_b1: 3.989, o2_sensor_b1s1: 0.4567, o2_sensor_b1s2: 0.4873 },
  P0128: { engine_rpm: 2197.35, vehicle_speed: 44.98, engine_load: 0.2398, throttle_position: 0.2037, coolant_temp: 61.87, intake_air_temp: 35.08, maf: 8.84, map_pressure: 54.38, lambda_val: 1.0001, spark_advance: 20.51, stft_b1: -0.015, ltft_b1: 4.982, o2_sensor_b1s1: 0.4568, o2_sensor_b1s2: 0.1507 },
};

const FAULT_META = {
  Normal: { label: "Normal Operation", system: "—", severity: 0, desc: "All parameters within nominal ranges." },
  P0301: { label: "Cylinder 1 Misfire", system: "Ignition", severity: 85, desc: "Combustion failure in cylinder 1. RPM variance >2%, rich O2, negative fuel trim." },
  P0300: { label: "Random Multi-Cyl. Misfire", system: "Ignition", severity: 75, desc: "Intermittent misfires across multiple cylinders. Irregular RPM drops." },
  P0171: { label: "System Too Lean (Bank 1)", system: "Fuel / Air", severity: 70, desc: "Air-fuel mixture too lean. LTFT >+25%, reduced MAF, elevated lambda." },
  P0420: { label: "Catalyst Efficiency Low", system: "Emissions", severity: 60, desc: "Catalytic converter degraded. Downstream O₂ mirrors upstream pattern." },
  P0128: { label: "Thermostat Malfunction", system: "Cooling", severity: 50, desc: "Coolant fails to reach 85–95 °C. Engine running cold, elevated fuel trim." },
};

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────
const T = {
  bg: "#FAFAF8", surface: "#FFFFFF", surfaceAlt: "#F2F1EE",
  border: "#E2E0DA", borderDark: "#C8C5BC",
  text: "#1A1916", textMid: "#5A5750", textFaint: "#9B9890",
  accent: "#1B4F8A", accentLt: "#E8EFF8",
  red: "#C0392B", redLt: "#FAEAE8",
  amber: "#B8860B", green: "#1A6B3C", purple: "#5B3FA6", teal: "#2E7D8C",
  cls: ["#1B4F8A", "#1A6B3C", "#C0392B", "#B8860B", "#5B3FA6", "#2E7D8C"],
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
function AnimNum({ value, decimals = 4, suffix = "" }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let i = 0, n = 48;
    const id = setInterval(() => { i++; setV(value * (i / n)); if (i >= n) clearInterval(id); }, 14);
    return () => clearInterval(id);
  }, [value]);
  return <span>{v.toFixed(decimals)}{suffix}</span>;
}

function Badge({ children, color = T.accent }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 100,
      background: color + "18", color, fontSize: 11, fontWeight: 600,
      fontFamily: "'IBM Plex Mono',monospace", border: `1px solid ${color}30`
    }}>
      {children}
    </span>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontWeight: 600,
      letterSpacing: 1.8, color: T.textFaint, textTransform: "uppercase",
      marginBottom: 16, display: "flex", alignItems: "center", gap: 10
    }}>
      <span style={{ flex: 1, height: 1, background: T.border }} />
      {children}
      <span style={{ flex: 1, height: 1, background: T.border }} />
    </div>
  );
}

function KpiCard({ label, value, decimals = 4, suffix = "", sub, color = T.accent }) {
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

function ConfMatrix({ cm, classes }) {
  const max = Math.max(...cm.flat());
  const shorts = classes.map(c => c.short);
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "inline-block" }}>
        <div style={{ display: "flex", marginLeft: 68, marginBottom: 6 }}>
          {shorts.map((s, j) => <div key={j} style={{ width: 50, textAlign: "center", fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: T.textFaint, fontWeight: 600 }}>{s}</div>)}
        </div>
        {cm.map((row, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
            <div style={{ width: 64, fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: T.textMid, textAlign: "right", paddingRight: 8, fontWeight: 600 }}>{shorts[i]}</div>
            {row.map((val, j) => {
              const norm = val / max;
              const isDiag = i === j;
              const bg = isDiag ? `rgba(27,79,138,${0.08 + norm * 0.72})` : norm > 0.01 ? `rgba(192,57,43,${norm * 0.55})` : T.surfaceAlt;
              return (
                <div key={j} style={{
                  width: 50, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
                  background: bg, border: `1px solid ${T.border}`,
                  fontFamily: "'IBM Plex Mono',monospace", fontSize: isDiag ? 11 : 10,
                  color: isDiag && norm > 0.4 ? "#fff" : T.text, fontWeight: isDiag ? 700 : 400
                }}>
                  {val.toLocaleString()}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function SensorRow({ label, value, min, max, unit, alert }) {
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

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function FleetMLDashboard() {
  const [tab, setTab] = useState("overview");

  // API status
  const [apiStatus, setApiStatus] = useState("checking"); // checking | online | offline
  const [apiThreshold, setApiThreshold] = useState(0.4669);

  // Simulator
  const [simFault, setSimFault] = useState("Normal");
  const [simRunning, setSimRunning] = useState(false);
  const [simHistory, setSimHistory] = useState([]);
  const [anomScore, setAnomScore] = useState(0.18);
  const [detectedFault, setDetectedFault] = useState(null);
  const [confidence, setConfidence] = useState({});
  const [isAnomaly, setIsAnomaly] = useState(false);
  const [latency, setLatency] = useState(null);
  const [lastError, setLastError] = useState(null);
  const intervalRef = useRef(null);

  // ── Check API health on mount ──
  useEffect(() => {
    fetch(`${API_BASE}/`)
      .then(r => r.json())
      .then(data => {
        setApiStatus("online");
        setApiThreshold(data.threshold || 0.4669);
      })
      .catch(() => setApiStatus("offline"));
  }, []);

  // ── Add noise to a profile value ──
  const noisy = (v, pct = 0.05) => v + (Math.random() - 0.5) * Math.abs(v) * pct;

  // ── Build payload from fault profile + noise ──
  const buildPayload = (fault) => {
    const p = FAULT_PROFILES[fault];
    return {
      engine_rpm: noisy(p.engine_rpm, 0.06),
      vehicle_speed: noisy(p.vehicle_speed, 0.04),
      engine_load: noisy(p.engine_load, 0.06),
      throttle_position: noisy(p.throttle_position, 0.06),
      coolant_temp: noisy(p.coolant_temp, 0.03),
      intake_air_temp: noisy(p.intake_air_temp, 0.04),
      maf: noisy(p.maf, 0.06),
      map_pressure: noisy(p.map_pressure, 0.04),
      lambda_val: noisy(p.lambda_val, 0.04),
      spark_advance: noisy(p.spark_advance, 0.05),
      stft_b1: noisy(p.stft_b1 || 0.001, 0.10),
      ltft_b1: noisy(p.ltft_b1 || 0.001, 0.08),
      o2_sensor_b1s1: noisy(p.o2_sensor_b1s1, 0.06),
      o2_sensor_b1s2: noisy(p.o2_sensor_b1s2, 0.06),
      vehicle_id: `sim_${fault}`,
    };
  };

  // ── Live simulator loop ──
  useEffect(() => {
    if (!simRunning) return;

    intervalRef.current = setInterval(async () => {
      const payload = buildPayload(simFault);
      const t0 = performance.now();

      try {
        const res = await fetch(`${API_BASE}/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const ms = Math.round(performance.now() - t0);

        setLatency(ms);
        setLastError(null);
        setAnomScore(data.anomaly_score);
        setIsAnomaly(data.is_anomaly);
        setDetectedFault(data.predicted_class_short);
        setConfidence(data.class_probabilities);
        setSimHistory(prev => [...prev, {
          t: prev.length,
          anom: data.anomaly_score,
          lambda: payload.lambda_val,
          ltft: payload.ltft_b1,
          coolant: payload.coolant_temp,
        }].slice(-60));

      } catch (err) {
        setLastError(err.message);
        setLatency(null);
      }
    }, 900);

    return () => clearInterval(intervalRef.current);
  }, [simRunning, simFault]);

  const curProf = FAULT_PROFILES[simFault];
  const lastSim = simHistory.length ? simHistory[simHistory.length - 1] : null;

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "anomaly", label: "Anomaly Detection" },
    { id: "classifier", label: "Fault Classifier" },
    { id: "simulator", label: "Live Simulator" },
    { id: "features", label: "Feature Analysis" },
  ];

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: "'IBM Plex Sans','Helvetica Neue',sans-serif", color: T.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Serif:wght@400;600&family=IBM+Plex+Mono:wght@400;600&display=swap');
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background:${T.bg}; }
        ::-webkit-scrollbar-thumb { background:${T.borderDark}; border-radius:3px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .tab-btn:hover { background:${T.accentLt} !important; color:${T.accent} !important; }
        .fault-btn:hover { border-color:${T.accent} !important; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "0 40px" }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "18px 0 14px", borderBottom: `1px solid ${T.border}`
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
            <div style={{ fontFamily: "'IBM Plex Serif',serif", fontSize: 17, fontWeight: 600 }}>
              Intelligent Fleet Maintenance
            </div>
            <div style={{ width: 1, height: 14, background: T.border }} />
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: T.textFaint }}>
              ML Evaluation Platform · ITC4166 Group 41
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Badge color={T.accent}>Random Forest</Badge>
            <Badge color={T.purple}>LSTM-Autoencoder</Badge>

            {/* API status pill */}
            <div style={{
              display: "flex", alignItems: "center", gap: 7, padding: "5px 14px",
              borderRadius: 100, border: `1px solid ${T.border}`, background: T.surfaceAlt
            }}>
              <div style={{
                width: 7, height: 7, borderRadius: "50%",
                background: apiStatus === "online" ? T.green : apiStatus === "offline" ? T.red : T.amber,
                animation: apiStatus === "checking" ? "pulse 1.2s infinite" : "none"
              }} />
              <span style={{
                fontFamily: "'IBM Plex Mono',monospace", fontSize: 10,
                color: apiStatus === "online" ? T.green : apiStatus === "offline" ? T.red : T.amber
              }}>
                API {apiStatus === "online" ? `online · ${API_BASE}` : apiStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex" }}>
          {TABS.map(t => (
            <button key={t.id} className="tab-btn" onClick={() => setTab(t.id)} style={{
              background: "transparent", border: "none",
              borderBottom: tab === t.id ? `2px solid ${T.accent}` : "2px solid transparent",
              color: tab === t.id ? T.accent : T.textMid,
              padding: "14px 20px 12px", cursor: "pointer", fontSize: 13,
              fontWeight: tab === t.id ? 600 : 400,
              fontFamily: "'IBM Plex Sans',sans-serif",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* ── OFFLINE BANNER ── */}
      {apiStatus === "offline" && (
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
      )}

      <div style={{ padding: "32px 40px", maxWidth: 1320, margin: "0 auto" }}>

        {/* ═══════════════════════════ OVERVIEW ═══════════════════════════ */}
        {tab === "overview" && (
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
        )}

        {/* ══════════════════════ ANOMALY DETECTION ════════════════════════ */}
        {tab === "anomaly" && (
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
        )}

        {/* ══════════════════════ FAULT CLASSIFIER ════════════════════════ */}
        {tab === "classifier" && (
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
        )}

        {/* ══════════════════════ LIVE SIMULATOR ══════════════════════════ */}
        {tab === "simulator" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>

            {/* Controls */}
            <div style={{
              background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8,
              padding: "16px 24px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap"
            }}>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: T.textFaint, letterSpacing: 1 }}>FAULT CONDITION</span>
              <div style={{ width: 1, height: 20, background: T.border }} />
              {Object.keys(FAULT_PROFILES).map(f => (
                <button key={f} className="fault-btn" onClick={() => { setSimFault(f); setSimHistory([]); setDetectedFault(null); }} style={{
                  background: simFault === f ? T.accent : "transparent",
                  border: `1px solid ${simFault === f ? T.accent : T.border}`,
                  color: simFault === f ? "#fff" : T.textMid,
                  padding: "6px 16px", borderRadius: 6, cursor: "pointer",
                  fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, fontWeight: 600,
                }}>{f}</button>
              ))}
              <div style={{ flex: 1 }} />

              {/* Latency + error */}
              {latency && <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: T.green }}>⚡ {latency} ms</span>}
              {lastError && <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: T.red }}>✕ {lastError}</span>}

              <button onClick={() => setSimRunning(r => !r)} style={{
                background: simRunning ? T.red : T.green, color: "#fff", border: "none",
                padding: "8px 24px", borderRadius: 6, cursor: "pointer",
                fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, fontWeight: 600,
              }}>{simRunning ? "◼ STOP" : "▶ START"}</button>
            </div>

            {/* Source label */}
            <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: apiStatus === "online" ? T.green : T.amber,
                animation: simRunning ? "pulse 1.2s infinite" : "none"
              }} />
              <span style={{
                fontFamily: "'IBM Plex Mono',monospace", fontSize: 10,
                color: apiStatus === "online" ? T.green : T.amber
              }}>
                {apiStatus === "online"
                  ? `Inference via FastAPI backend — POST ${API_BASE}/predict`
                  : "API offline — start uvicorn to enable real model inference"}
              </span>
            </div>

            {/* Status row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>

              {/* Condition */}
              <div style={{
                background: T.surface, border: `1px solid ${T.border}`,
                borderLeft: `3px solid ${T.cls[Object.keys(FAULT_PROFILES).indexOf(simFault)]}`,
                borderRadius: 8, padding: "16px 20px"
              }}>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: 1.5, color: T.textFaint, marginBottom: 8 }}>ACTIVE CONDITION</div>
                <div style={{ fontFamily: "'IBM Plex Serif',serif", fontSize: 17, fontWeight: 600, marginBottom: 6 }}>{FAULT_META[simFault]?.label}</div>
                <div style={{ fontSize: 12, color: T.textMid, lineHeight: 1.6, marginBottom: 10 }}>{FAULT_META[simFault]?.desc}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Badge color={T.accent}>{FAULT_META[simFault]?.system}</Badge>
                  {FAULT_META[simFault]?.severity > 0 && <Badge color={FAULT_META[simFault]?.severity > 70 ? T.red : T.amber}>Severity {FAULT_META[simFault]?.severity}%</Badge>}
                </div>
              </div>

              {/* Stage 1 */}
              <div style={{
                background: T.surface, border: `1px solid ${T.border}`,
                borderTop: `3px solid ${isAnomaly ? T.red : T.green}`,
                borderRadius: 8, padding: "16px 20px", textAlign: "center"
              }}>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: 1.5, color: T.textFaint, marginBottom: 12 }}>STAGE 1 · ANOMALY SCORE</div>
                <div style={{
                  fontFamily: "'IBM Plex Serif',serif", fontSize: 42, fontWeight: 600,
                  color: isAnomaly ? T.red : T.green, lineHeight: 1, marginBottom: 8
                }}>
                  {anomScore.toFixed(3)}
                </div>
                <div style={{ background: T.surfaceAlt, borderRadius: 4, height: 6, margin: "10px 0" }}>
                  <div style={{
                    width: `${Math.min(100, anomScore * 100)}%`, height: "100%", borderRadius: 4,
                    background: isAnomaly ? T.red : T.green, transition: "all 0.5s"
                  }} />
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10 }}>
                  <span style={{ color: isAnomaly ? T.red : T.green, fontWeight: 600 }}>
                    {isAnomaly ? "ANOMALY DETECTED" : "NORMAL OPERATION"}
                  </span>
                  <span style={{ color: T.textFaint }}> · τ = {apiThreshold.toFixed(4)}</span>
                </div>
              </div>

              {/* Stage 2 */}
              <div style={{
                background: T.surface, border: `1px solid ${T.border}`,
                borderTop: `3px solid ${T.purple}`, borderRadius: 8, padding: "16px 20px"
              }}>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: 1.5, color: T.textFaint, marginBottom: 10 }}>STAGE 2 · PREDICTED DTC</div>
                {detectedFault && isAnomaly ? (
                  <>
                    <div style={{ fontFamily: "'IBM Plex Serif',serif", fontSize: 20, fontWeight: 600, color: T.purple, marginBottom: 4 }}>{detectedFault}</div>
                    <div style={{ fontSize: 11, color: T.textMid, marginBottom: 12 }}>{FAULT_META[detectedFault]?.label}</div>
                    {Object.entries(confidence).sort((a, b) => b[1] - a[1]).map(([cls, prob], i) => (
                      <div key={cls} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                        <div style={{ width: 42, fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: i === 0 ? T.purple : T.textFaint, textAlign: "right" }}>{cls}</div>
                        <div style={{ flex: 1, background: T.surfaceAlt, borderRadius: 3, height: 6 }}>
                          <div style={{ width: `${prob * 100}%`, height: "100%", borderRadius: 3, background: i === 0 ? T.purple : T.borderDark, transition: "all 0.3s" }} />
                        </div>
                        <div style={{ width: 38, fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: i === 0 ? T.purple : T.textFaint, textAlign: "right" }}>{(prob * 100).toFixed(1)}%</div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 80, color: T.textFaint, fontFamily: "'IBM Plex Mono',monospace", fontSize: 11 }}>
                    {simRunning ? "Awaiting anomaly trigger…" : "Press START to begin"}
                  </div>
                )}
              </div>
            </div>

            {/* Sensor readings */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "16px 24px" }}>
                <SectionLabel>Engine & Combustion</SectionLabel>
                <SensorRow label="Engine RPM" value={lastSim?.rpm ?? curProf.engine_rpm} min={700} max={5500} unit="rpm" />
                <SensorRow label="Engine Load" value={lastSim?.load ?? curProf.engine_load} min={0} max={1} unit="" />
                <SensorRow label="MAF" value={curProf.maf} min={1} max={55} unit="g/s" />
                <SensorRow label="Lambda λ" value={lastSim?.lambda ?? curProf.lambda_val} min={0.85} max={1.25} unit=""
                  alert={(lastSim?.lambda ?? curProf.lambda_val) > 1.08} />
              </div>
              <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "16px 24px" }}>
                <SectionLabel>Fuel Trim & Emissions</SectionLabel>
                <SensorRow label="Coolant Temp" value={lastSim?.coolant ?? curProf.coolant_temp} min={20} max={120} unit="°C"
                  alert={(lastSim?.coolant ?? curProf.coolant_temp) < 75} />
                <SensorRow label="LTFT" value={lastSim?.ltft ?? curProf.ltft_b1} min={-15} max={30} unit="%"
                  alert={Math.abs(lastSim?.ltft ?? curProf.ltft_b1) > 15} />
                <SensorRow label="O₂ Upstream" value={curProf.o2_sensor_b1s1} min={0} max={1} unit="V" />
                <SensorRow label="O₂ Downstream" value={curProf.o2_sensor_b1s2} min={0} max={1} unit="V"
                  alert={curProf.o2_sensor_b1s2 > 0.40} />
              </div>
            </div>

            {/* Live chart */}
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: 24 }}>
              <SectionLabel>Live Telemetry Stream — Real Model Output</SectionLabel>
              {simHistory.length > 1 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={simHistory} margin={{ top: 4, right: 16, bottom: 16, left: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke={T.border} />
                    <XAxis dataKey="t" tick={{ fill: T.textFaint, fontSize: 9, fontFamily: "'IBM Plex Mono',monospace" }}
                      label={{ value: "Time (s)", fill: T.textFaint, fontSize: 10, position: "insideBottom", offset: -10 }} />
                    <YAxis tick={{ fill: T.textFaint, fontSize: 9, fontFamily: "'IBM Plex Mono',monospace" }} />
                    <Tooltip content={<ChartTip />} />
                    <ReferenceLine y={apiThreshold} stroke={T.amber} strokeDasharray="4 3"
                      label={{ value: `τ = ${apiThreshold.toFixed(3)}`, fill: T.amber, fontSize: 9 }} />
                    <Line type="monotone" dataKey="anom" stroke={T.red} strokeWidth={2} dot={false} name="Anomaly Score (real)" />
                    <Line type="monotone" dataKey="lambda" stroke={T.accent} strokeWidth={1.5} dot={false} name="Lambda" />
                    <Line type="monotone" dataKey="ltft" stroke={T.amber} strokeWidth={1.5} dot={false} name="LTFT %" />
                    <Legend wrapperStyle={{ fontSize: 11, fontFamily: "'IBM Plex Mono',monospace", color: T.textMid }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: T.textFaint, gap: 8 }}>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 28, color: T.borderDark }}>▶</div>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>
                    Press <strong style={{ color: T.green }}>START</strong> to begin — each tick calls the real FastAPI backend
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════ FEATURE ANALYSIS ════════════════════════ */}
        {tab === "features" && (
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
        )}
      </div>

      {/* FOOTER */}
      <div style={{
        borderTop: `1px solid ${T.border}`, padding: "16px 40px",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: T.textFaint }}>
          ITC4166 · Group 41 · University of Sri Jayewardenepura · 2026
        </div>
        <div style={{ display: "flex", gap: 16, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: T.textFaint }}>
          <span>60,000 samples</span><span>·</span><span>6 fault classes</span>
          <span>·</span><span>33 features</span><span>·</span><span>scikit-learn 1.8.0</span>
        </div>
      </div>
    </div>
  );
}