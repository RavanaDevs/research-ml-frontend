import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Legend
} from "recharts";
import { FAULT_PROFILES, FAULT_META, T, API_BASE } from "../../constants/data";
import SectionLabel from "../ui/SectionLabel";
import SensorRow from "../ui/SensorRow";
import Badge from "../ui/Badge";
import ChartTip from "../ui/ChartTip";

export default function SimulatorTab({
  apiStatus, simFault, setSimFault, simRunning, setSimRunning,
  setSimHistory, setDetectedFault, latency, lastError,
  simHistory, anomScore, isAnomaly, apiThreshold,
  detectedFault, confidence
}) {
  const curProf = FAULT_PROFILES[simFault];
  const lastSim = simHistory.length ? simHistory[simHistory.length - 1] : null;

  return (
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
          <SectionLabel>Engine &amp; Combustion</SectionLabel>
          <SensorRow label="Engine RPM" value={lastSim?.rpm ?? curProf.engine_rpm} min={700} max={5500} unit="rpm" />
          <SensorRow label="Engine Load" value={lastSim?.load ?? curProf.engine_load} min={0} max={1} unit="" />
          <SensorRow label="MAF" value={curProf.maf} min={1} max={55} unit="g/s" />
          <SensorRow label="Lambda λ" value={lastSim?.lambda ?? curProf.lambda_val} min={0.85} max={1.25} unit=""
            alert={(lastSim?.lambda ?? curProf.lambda_val) > 1.08} />
        </div>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "16px 24px" }}>
          <SectionLabel>Fuel Trim &amp; Emissions</SectionLabel>
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
  );
}
