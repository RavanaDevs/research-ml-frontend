import { T } from "../../constants/data";

export default function SectionLabel({ children }) {
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
