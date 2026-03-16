import { T } from "../../constants/data";

export default function ConfMatrix({ cm, classes }) {
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
