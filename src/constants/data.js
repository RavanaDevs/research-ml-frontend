// ── API CONFIG ────────────────────────────────────────────────────────────────
export const API_BASE = "http://localhost:8000";

// ── STATIC MODEL DATA ─────────────────────────────────────────────────────────
export const MODEL_DATA = {
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
const FAULT_PROFILES = {
  Normal: { engine_rpm: 2203.27, vehicle_speed: 44.85, engine_load: 0.2407, throttle_position: 0.2046, coolant_temp: 88.02, intake_air_temp: 34.99, maf: 9.73, map_pressure: 54.46, lambda_val: 1.0000, spark_advance: 15.04, stft_b1: -0.004, ltft_b1: 0.995, o2_sensor_b1s1: 0.4573, o2_sensor_b1s2: 0.1506 },
  P0301: { engine_rpm: 2203.14, vehicle_speed: 45.00, engine_load: 0.2412, throttle_position: 0.2053, coolant_temp: 87.97, intake_air_temp: 34.94, maf: 9.76, map_pressure: 54.49, lambda_val: 0.9599, spark_advance: 14.99, stft_b1: -2.495, ltft_b1: -4.031, o2_sensor_b1s1: 0.7797, o2_sensor_b1s2: 0.1506 },
  P0300: { engine_rpm: 2132.50, vehicle_speed: 44.98, engine_load: 0.2119, throttle_position: 0.2040, coolant_temp: 88.00, intake_air_temp: 35.13, maf: 9.66, map_pressure: 54.38, lambda_val: 0.9999, spark_advance: 14.98, stft_b1: 0.012, ltft_b1: -0.996, o2_sensor_b1s1: 0.5032, o2_sensor_b1s2: 0.1500 },
  P0171: { engine_rpm: 2203.98, vehicle_speed: 44.80, engine_load: 0.2404, throttle_position: 0.2041, coolant_temp: 87.96, intake_air_temp: 35.04, maf: 7.53, map_pressure: 44.43, lambda_val: 1.1207, spark_advance: 15.00, stft_b1: 11.993, ltft_b1: 21.951, o2_sensor_b1s1: 0.7191, o2_sensor_b1s2: 0.1503 },
  P0420: { engine_rpm: 2200.56, vehicle_speed: 45.12, engine_load: 0.2406, throttle_position: 0.2042, coolant_temp: 88.03, intake_air_temp: 34.97, maf: 9.70, map_pressure: 54.42, lambda_val: 0.9998, spark_advance: 14.99, stft_b1: 0.040, ltft_b1: 3.989, o2_sensor_b1s1: 0.4567, o2_sensor_b1s2: 0.4873 },
  P0128: { engine_rpm: 2197.35, vehicle_speed: 44.98, engine_load: 0.2398, throttle_position: 0.2037, coolant_temp: 61.87, intake_air_temp: 35.08, maf: 8.84, map_pressure: 54.38, lambda_val: 1.0001, spark_advance: 20.51, stft_b1: -0.015, ltft_b1: 4.982, o2_sensor_b1s1: 0.4568, o2_sensor_b1s2: 0.1507 },
};

export const FAULT_META = {
  Normal: { label: "Normal Operation", system: "—", severity: 0, desc: "All parameters within nominal ranges." },
  P0301: { label: "Cylinder 1 Misfire", system: "Ignition", severity: 85, desc: "Combustion failure in cylinder 1. RPM variance >2%, rich O2, negative fuel trim." },
  P0300: { label: "Random Multi-Cyl. Misfire", system: "Ignition", severity: 75, desc: "Intermittent misfires across multiple cylinders. Irregular RPM drops." },
  P0171: { label: "System Too Lean (Bank 1)", system: "Fuel / Air", severity: 70, desc: "Air-fuel mixture too lean. LTFT >+25%, reduced MAF, elevated lambda." },
  P0420: { label: "Catalyst Efficiency Low", system: "Emissions", severity: 60, desc: "Catalytic converter degraded. Downstream O₂ mirrors upstream pattern." },
  P0128: { label: "Thermostat Malfunction", system: "Cooling", severity: 50, desc: "Coolant fails to reach 85–95 °C. Engine running cold, elevated fuel trim." },
};

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────
export const T = {
  bg: "#FAFAF8", surface: "#FFFFFF", surfaceAlt: "#F2F1EE",
  border: "#E2E0DA", borderDark: "#C8C5BC",
  text: "#1A1916", textMid: "#5A5750", textFaint: "#9B9890",
  accent: "#1B4F8A", accentLt: "#E8EFF8",
  red: "#C0392B", redLt: "#FAEAE8",
  amber: "#B8860B", green: "#1A6B3C", purple: "#5B3FA6", teal: "#2E7D8C",
  cls: ["#1B4F8A", "#1A6B3C", "#C0392B", "#B8860B", "#5B3FA6", "#2E7D8C"],
};

export const TABS = [
  { id: "overview", label: "Overview" },
  { id: "anomaly", label: "Anomaly Detection" },
  { id: "classifier", label: "Fault Classifier" },
  { id: "simulator", label: "Live Simulator" },
  { id: "features", label: "Feature Analysis" },
];
