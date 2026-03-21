import CyberPanel from "./CyberPanel";

const VERDICT_CFG = {
  OVERPRICED:  { color:"var(--red)",     glow:"0 0 20px rgba(255,59,92,0.3)",  icon:"⚠", label:"OVERPRICED",  accent:"red" },
  FAIR:        { color:"var(--green)",   glow:"0 0 20px rgba(0,255,136,0.3)",  icon:"✓", label:"FAIR PRICE",  accent:"green" },
  UNDERPRICED: { color:"var(--cyan)",    glow:"var(--glow-cyan)",              icon:"↓", label:"UNDERPRICED", accent:"cyan" },
  UNKNOWN:     { color:"var(--text3)",   glow:"none",                          icon:"?", label:"UNKNOWN",     accent:"cyan" },
};

function Bar({ pct, color }) {
  return (
    <div style={{ height:3, background:"var(--border)", width:"100%" }}>
      <div style={{
        height:"100%", width:`${pct}%`, background:color,
        boxShadow:`0 0 8px ${color}`,
        transition:"width 1s cubic-bezier(0.16,1,0.3,1)",
      }} />
    </div>
  );
}

function TagChip({ label, color }) {
  return (
    <span style={{
      background:`${color}12`, border:`1px solid ${color}44`,
      color, padding:"3px 10px", fontSize:"0.68rem", letterSpacing:"0.06em",
      display:"inline-block",
    }}>
      {label}
    </span>
  );
}

export default function AnalysisResult({ analysis }) {
  const { result, productName, listedPrice, currency, cached } = analysis;
  const cfg = VERDICT_CFG[result.verdict] || VERDICT_CFG.UNKNOWN;

  return (
    <div className="animate-fade-up bracket-box" style={{
      background:"var(--surface)", border:`1px solid var(--border)`,
      borderTop:`2px solid ${cfg.color}`, overflow:"hidden",
    }}>
      {/* Verdict banner */}
      <div style={{
        padding:"20px 24px",
        borderBottom:"1px solid var(--border)",
        background:`radial-gradient(ellipse at top left, ${cfg.color}10, transparent 60%)`,
        display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{
            width:50, height:50, border:`1px solid ${cfg.color}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:22, color:cfg.color, boxShadow:cfg.glow, flexShrink:0,
            fontFamily:"var(--font-head)",
          }}>
            {cfg.icon}
          </div>
          <div>
            <div style={{ fontSize:"0.55rem", color:"var(--text3)", letterSpacing:"0.2em", marginBottom:2 }}>VERDICT</div>
            <div style={{
              fontFamily:"var(--font-head)", fontSize:"1.4rem", fontWeight:700,
              color:cfg.color, textShadow:cfg.glow, letterSpacing:"0.08em",
            }}>
              {cfg.label}
            </div>
            <div style={{ fontSize:"0.65rem", color:"var(--text3)", marginTop:2 }}>{productName}</div>
          </div>
        </div>

        <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
          {[
            { label:"LISTED",    val:`${currency} ${listedPrice?.toLocaleString()}`,           color:"var(--text)" },
            { label:"FAIR VALUE",val:`${currency} ${result.estimatedFairPrice?.toLocaleString()}`, color:cfg.color },
            result.overpricingPercent !== 0 && { label:"DELTA", val:`${result.overpricingPercent > 0 ? "+" : ""}${result.overpricingPercent}%`, color:cfg.color },
          ].filter(Boolean).map(item => (
            <div key={item.label} style={{ textAlign:"right" }}>
              <div style={{ fontSize:"0.52rem", color:"var(--text3)", letterSpacing:"0.15em", marginBottom:2 }}>{item.label}</div>
              <div style={{ fontFamily:"var(--font-head)", fontSize:"1.2rem", fontWeight:700, color:item.color }}>{item.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:18 }}>
        {/* Confidence */}
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:"0.58rem", color:"var(--text3)", letterSpacing:"0.15em" }}>
            <span>CONFIDENCE SCORE</span>
            <span style={{ color: result.confidenceScore >= 70 ? "var(--green)" : result.confidenceScore >= 40 ? "var(--yellow)" : "var(--red)" }}>
              {result.confidenceScore}%
            </span>
          </div>
          <Bar pct={result.confidenceScore}
            color={result.confidenceScore >= 70 ? "var(--green)" : result.confidenceScore >= 40 ? "var(--yellow)" : "var(--red)"} />
        </div>

        {/* Analysis */}
        <div style={{ background:"var(--surface2)", border:"1px solid var(--border)", padding:"12px 16px" }}>
          <div style={{ fontSize:"0.55rem", color:"var(--text3)", letterSpacing:"0.18em", marginBottom:8 }}>AI ANALYSIS</div>
          <p style={{ fontSize:"0.78rem", color:"var(--text2)", lineHeight:1.8 }}>{result.reasoning}</p>
        </div>

        {/* Market comparison */}
        {result.marketComparison && (
          <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
            <span style={{ color:"var(--cyan)", fontSize:12, marginTop:2 }}>◈</span>
            <p style={{ fontSize:"0.75rem", color:"var(--text3)", lineHeight:1.7 }}>{result.marketComparison}</p>
          </div>
        )}

        {/* Red flags + suggestions */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <div>
            <div style={{ fontSize:"0.55rem", color:"var(--text3)", letterSpacing:"0.18em", marginBottom:8 }}>RED FLAGS</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {result.redFlags?.length
                ? result.redFlags.map((f,i) => <TagChip key={i} label={f} color="var(--red)" />)
                : <span style={{ fontSize:"0.68rem", color:"var(--text3)" }}>None detected</span>}
            </div>
          </div>
          <div>
            <div style={{ fontSize:"0.55rem", color:"var(--text3)", letterSpacing:"0.18em", marginBottom:8 }}>SUGGESTIONS</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {result.suggestions?.length
                ? result.suggestions.map((s,i) => <TagChip key={i} label={s} color="var(--green)" />)
                : <span style={{ fontSize:"0.68rem", color:"var(--text3)" }}>None</span>}
            </div>
          </div>
        </div>

        {/* Meta */}
        <div style={{ borderTop:"1px solid var(--border)", paddingTop:12, display:"flex", gap:14, fontSize:"0.6rem", color:"var(--text3)", flexWrap:"wrap", alignItems:"center" }}>
          {cached && <span style={{ color:"var(--yellow)", border:"1px solid rgba(255,229,0,0.3)", padding:"1px 8px" }}>CACHED</span>}
          <span>POWERED BY CLAUDE AI</span>
          <span style={{ marginLeft:"auto", color:"var(--green)", animation:"blink 3s infinite" }}>● SCAN COMPLETE</span>
        </div>
      </div>
    </div>
  );
}
