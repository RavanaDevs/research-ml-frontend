import { useState, useEffect } from "react";

export default function AnimNum({ value, decimals = 4, suffix = "" }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let i = 0, n = 48;
    const id = setInterval(() => { i++; setV(value * (i / n)); if (i >= n) clearInterval(id); }, 14);
    return () => clearInterval(id);
  }, [value]);
  return <span>{v.toFixed(decimals)}{suffix}</span>;
}
