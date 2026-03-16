import { T } from "../../constants/data";

export default function Badge({ children, color = T.accent }) {
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
