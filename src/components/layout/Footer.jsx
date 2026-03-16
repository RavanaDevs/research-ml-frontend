import { T } from "../../constants/data";

export default function Footer() {
  return (
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
  );
}
