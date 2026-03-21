/* Generic result renderer for feature outputs */
import CyberPanel from "./CyberPanel";

export function ScoreBar({ label, value, max = 100, color }) {
  const pct = Math.min(100, (value / max) * 100);
  const c = color || (pct >= 70 ? "var(--green)" : pct >= 40 ? "var(--yellow)" : "var(--red)");
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.6rem", color:"var(--text3)", letterSpacing:"0.1em", marginBottom:5 }}>
        <span>{label}</span><span style={{ color: c }}>{value}{max===100?"%":""}</span>
      </div>
      <div style={{ height:3, background:"var(--border)" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:c, boxShadow:`0 0 6px ${c}`, transition:"width 1s cubic-bezier(0.16,1,0.3,1)" }} />
      </div>
    </div>
  );
}

export function TagList({ items = [], color = "var(--cyan)", emptyText = "None" }) {
  if (!items.length) return <span style={{ fontSize:"0.68rem", color:"var(--text3)" }}>{emptyText}</span>;
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
      {items.map((t,i) => (
        <span key={i} style={{
          background:`${color}12`, border:`1px solid ${color}44`,
          color, padding:"3px 10px", fontSize:"0.68rem", letterSpacing:"0.04em",
        }}>{t}</span>
      ))}
    </div>
  );
}

export function SectionLabel({ children }) {
  return (
    <div style={{ fontSize:"0.55rem", color:"var(--text3)", letterSpacing:"0.18em", marginBottom:8 }}>
      {children}
    </div>
  );
}

export function VerdictBadge({ verdict, colorMap = {} }) {
  const defaults = {
    OVERPRICED:"var(--red)", FAIR:"var(--green)", UNDERPRICED:"var(--cyan)",
    TRAP:"var(--red)", GENUINE:"var(--green)", FAKE:"var(--red)",
    GREAT_DEAL:"var(--green)", GOOD_DEAL:"var(--green)", MARGINAL:"var(--yellow)",
    GOOD_VALUE:"var(--green)", EXCELLENT_VALUE:"var(--cyan)", RIPOFF:"var(--red)",
    MANIPULATIVE:"var(--red)", SUSPICIOUS:"var(--yellow)", SAFE:"var(--green)",
    PREDATORY:"var(--red)", TRUSTED:"var(--green)", NEUTRAL:"var(--text2)",
    SCAM_RISK:"var(--red)", BUY:"var(--green)", AVOID:"var(--red)", NEGOTIATE:"var(--yellow)",
    WORTH_IT:"var(--green)", OVERPRICED_FOR_QUALITY:"var(--red)",
  };
  const c = colorMap[verdict] || defaults[verdict] || "var(--text2)";
  return (
    <span style={{
      border:`1px solid ${c}55`, color:c, padding:"3px 12px",
      fontSize:"0.65rem", letterSpacing:"0.1em", fontFamily:"var(--font-head)",
      boxShadow:`0 0 8px ${c}33`,
    }}>{verdict?.replace(/_/g," ")}</span>
  );
}

export function FeatureError({ error }) {
  return (
    <div style={{
      background:"rgba(255,59,92,0.06)", border:"1px solid rgba(255,59,92,0.25)",
      padding:"12px 16px", fontSize:"0.75rem", color:"var(--red)",
    }}>✕ {error}</div>
  );
}

export function Spinner() {
  return (
    <div style={{ display:"flex", justifyContent:"center", padding:40 }}>
      <div style={{ width:24, height:24, border:"1px solid var(--cyan)", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
    </div>
  );
}
