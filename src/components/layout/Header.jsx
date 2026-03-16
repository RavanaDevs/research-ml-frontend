import { T, TABS, API_BASE } from "../../constants/data";
import Badge from "../ui/Badge";

export default function Header({ tab, setTab, apiStatus }) {
  return (
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
  );
}
