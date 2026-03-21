import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const CATEGORIES = ["Electronics","Fashion","Home & Kitchen","Books","Beauty","Sports","Toys","Grocery","Automotive","Other"];
const CURRENCIES = ["INR","USD","EUR","GBP","AED","SGD"];
const MARKETS    = ["Amazon","Flipkart","Meesho","Myntra","Nykaa","Snapdeal","Croma","Other"];

const VC = {
  OVERPRICED:  { color:"#FF5F5F", glow:"rgba(255,95,95,0.25)",  icon:"⚠", label:"Overpriced",  bg:"rgba(255,95,95,0.06)"  },
  FAIR:        { color:"#00E5A0", glow:"rgba(0,229,160,0.25)",  icon:"✓", label:"Fair Price",  bg:"rgba(0,229,160,0.06)"  },
  UNDERPRICED: { color:"#38C8FF", glow:"rgba(56,200,255,0.25)", icon:"↓", label:"Underpriced", bg:"rgba(56,200,255,0.06)" },
  UNKNOWN:     { color:"#4A4F6E", glow:"rgba(74,79,110,0.2)",   icon:"?", label:"Unknown",     bg:"rgba(74,79,110,0.06)"  },
};

export default function AnalyzePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ productName:"", category:"Electronics", listedPrice:"", currency:"INR", marketplace:"Amazon", description:"" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showAdv, setShowAdv] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAnalyze = async () => {
    if (!form.productName || !form.listedPrice) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const { data } = await api.post("/analyze", { ...form, listedPrice: parseFloat(form.listedPrice) });
      setResult(data);
    } catch (e) {
      setError(e.response?.data?.error || "Analysis failed. Please try again.");
    } finally { setLoading(false); }
  };

  const reset = () => {
    setResult(null); setError(null);
    setForm({ productName:"", category:"Electronics", listedPrice:"", currency:"INR", marketplace:"Amazon", description:"" });
  };

  if (result) return <ResultCard result={result} form={form} onReset={reset} onChat={() => navigate("/chat")} />;

  return (
    <div style={{ padding:"20px 16px 8px" }}>
      <div className="a1" style={{ marginBottom:20 }}>
        <div style={{ fontFamily:"var(--f-display)", fontSize:"0.6rem", fontWeight:700, color:"var(--c-emerald)", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:4 }}>AI Price Analysis</div>
        <h1 style={{ fontFamily:"var(--f-display)", fontSize:"1.4rem", fontWeight:800, color:"var(--c-text)" }}>Scan Any Product</h1>
        <p style={{ fontSize:"0.8rem", color:"var(--c-text3)", marginTop:4 }}>Enter product details — AI will analyze the price instantly</p>
      </div>

      <div className="a2" style={{ background:"linear-gradient(135deg,rgba(0,229,160,0.08),rgba(124,111,255,0.08))", border:"1px solid rgba(0,229,160,0.15)", borderRadius:16, padding:"12px 14px", display:"flex", gap:10, alignItems:"center", marginBottom:16 }}>
        <span style={{ fontSize:18 }}>💡</span>
        <div>
          <div style={{ fontFamily:"var(--f-display)", fontSize:"0.72rem", fontWeight:700, color:"var(--c-emerald)" }}>Pro Tip</div>
          <div style={{ fontSize:"0.7rem", color:"var(--c-text3)", marginTop:1 }}>Copy the product name from Amazon or Flipkart and paste it below</div>
        </div>
      </div>

      <div className="a3 glass" style={{ padding:20, borderRadius:20, marginBottom:14 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <label className="label">Product Name *</label>
            <input className="input" placeholder="e.g. Sony WH-1000XM5 Wireless Headphones" value={form.productName} onChange={e => set("productName", e.target.value)} />
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label className="label">Listed Price *</label>
              <input className="input" type="number" placeholder="0" value={form.listedPrice} onChange={e => set("listedPrice", e.target.value)} />
            </div>
            <div>
              <label className="label">Currency</label>
              <select className="input" value={form.currency} onChange={e => set("currency", e.target.value)}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={e => set("category", e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <button onClick={() => setShowAdv(!showAdv)} style={{ display:"flex", alignItems:"center", gap:8, background:"none", border:"none", cursor:"pointer", color:"var(--c-text3)", fontFamily:"var(--f-display)", fontSize:"0.72rem", fontWeight:600, padding:0 }}>
            <span style={{ transform:showAdv?"rotate(90deg)":"none", transition:"0.2s", display:"inline-block", fontSize:10 }}>▶</span>
            Advanced Options
          </button>

          {showAdv && <>
            <div>
              <label className="label">Marketplace</label>
              <select className="input" value={form.marketplace} onChange={e => set("marketplace", e.target.value)}>
                {MARKETS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Description (optional)</label>
              <textarea className="input" rows={3} placeholder="Extra details, specs, seller info..." value={form.description} onChange={e => set("description", e.target.value)} />
            </div>
          </>}
        </div>
      </div>

      {error && (
        <div style={{ background:"rgba(255,95,95,0.08)", border:"1px solid rgba(255,95,95,0.2)", borderRadius:14, padding:"12px 16px", marginBottom:14, fontSize:"0.8rem", color:"var(--c-over)", display:"flex", gap:8 }}>
          <span>⚠</span><span>{error}</span>
        </div>
      )}

      <button className="btn btn-primary btn-full a4" onClick={handleAnalyze} disabled={loading || !form.productName || !form.listedPrice} style={{ padding:"16px", borderRadius:16, fontSize:"0.95rem" }}>
        {loading
          ? <><div className="spinner" style={{ width:20, height:20, border:"2.5px solid rgba(7,8,15,0.3)", borderTopColor:"var(--c-bg)" }} />Analyzing with AI...</>
          : "⊙ Analyze Price"}
      </button>
    </div>
  );
}

function ResultCard({ result, form, onReset, onChat }) {
  const cfg = VC[result.verdict] || VC.UNKNOWN;
  const saving = result.verdict === "OVERPRICED" && result.estimatedFairPrice
    ? parseFloat(form.listedPrice) - result.estimatedFairPrice : 0;

  return (
    <div style={{ padding:"20px 16px 8px" }}>
      {/* Verdict Hero */}
      <div className="a1" style={{ borderRadius:24, padding:"28px 20px", marginBottom:14, textAlign:"center", background:`linear-gradient(135deg,${cfg.bg},rgba(0,0,0,0))`, border:`1px solid ${cfg.color}25`, boxShadow:`0 8px 40px ${cfg.glow},var(--shadow-card)`, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-60, right:-60, width:200, height:200, borderRadius:"50%", background:`radial-gradient(circle,${cfg.glow} 0%,transparent 70%)` }} />
        <div style={{ fontFamily:"var(--f-display)", fontSize:"4rem", lineHeight:1, marginBottom:8 }}>{cfg.icon}</div>
        <div style={{ fontFamily:"var(--f-display)", fontSize:"1.9rem", fontWeight:800, color:cfg.color, marginBottom:6 }}>{cfg.label}</div>
        {result.overpricingPercent !== 0 && (
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 16px", borderRadius:99, background:`${cfg.color}15`, border:`1px solid ${cfg.color}25` }}>
            <span style={{ fontFamily:"var(--f-mono)", fontSize:"0.85rem", fontWeight:700, color:cfg.color }}>
              {result.overpricingPercent > 0 ? "+" : ""}{result.overpricingPercent}%
            </span>
            <span style={{ fontSize:"0.7rem", color:"var(--c-text3)" }}>from fair price</span>
          </div>
        )}
        {result.marketComparison && <p style={{ fontSize:"0.78rem", color:"var(--c-text2)", marginTop:10, lineHeight:1.6 }}>{result.marketComparison}</p>}
      </div>

      {/* Price Breakdown */}
      <div className="a2 glass" style={{ padding:16, borderRadius:20, marginBottom:12 }}>
        <div className="section-title">Price Breakdown</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <div style={{ textAlign:"center", padding:"14px 8px", background:"var(--c-surface2)", borderRadius:14 }}>
            <div style={{ fontFamily:"var(--f-display)", fontSize:"0.55rem", color:"var(--c-text3)", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:6 }}>Listed Price</div>
            <div style={{ fontFamily:"var(--f-mono)", fontSize:"1.2rem", fontWeight:700, color:"var(--c-text)" }}>{form.currency} {parseFloat(form.listedPrice).toLocaleString()}</div>
          </div>
          <div style={{ textAlign:"center", padding:"14px 8px", background:`${cfg.color}08`, borderRadius:14, border:`1px solid ${cfg.color}20` }}>
            <div style={{ fontFamily:"var(--f-display)", fontSize:"0.55rem", color:"var(--c-text3)", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:6 }}>Fair Price</div>
            <div style={{ fontFamily:"var(--f-mono)", fontSize:"1.2rem", fontWeight:700, color:cfg.color }}>{form.currency} {result.estimatedFairPrice?.toLocaleString()}</div>
          </div>
        </div>
        {saving > 0 && (
          <div style={{ marginTop:10, background:"rgba(0,229,160,0.08)", border:"1px solid rgba(0,229,160,0.2)", borderRadius:12, padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:"0.78rem", color:"var(--c-text2)" }}>💰 You could save</span>
            <span style={{ fontFamily:"var(--f-mono)", fontWeight:700, color:"var(--c-emerald)", fontSize:"1rem" }}>{form.currency} {Math.round(saving).toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Confidence */}
      <div className="a3 glass" style={{ padding:16, borderRadius:20, marginBottom:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <div className="section-title" style={{ margin:0 }}>AI Confidence</div>
          <div style={{ fontFamily:"var(--f-mono)", fontSize:"0.9rem", fontWeight:700, color:"var(--c-emerald)" }}>{result.confidenceScore}%</div>
        </div>
        <div className="progress-track"><div className="progress-fill" style={{ width:`${result.confidenceScore}%` }} /></div>
      </div>

      {/* Reasoning */}
      {result.reasoning && (
        <div className="a3 glass" style={{ padding:16, borderRadius:20, marginBottom:12 }}>
          <div className="section-title">AI Analysis</div>
          <p style={{ fontSize:"0.83rem", color:"var(--c-text2)", lineHeight:1.75 }}>{result.reasoning}</p>
        </div>
      )}

      {/* Red Flags */}
      {result.redFlags?.length > 0 && (
        <div className="a4 glass" style={{ padding:16, borderRadius:20, marginBottom:12, borderColor:"rgba(255,95,95,0.15)" }}>
          <div className="section-title" style={{ color:"var(--c-over)" }}>⚠ Red Flags</div>
          {result.redFlags.map((f, i) => (
            <div key={i} style={{ display:"flex", gap:10, padding:"8px 0", borderBottom: i < result.redFlags.length-1 ? "1px solid var(--c-border)" : "none" }}>
              <span style={{ color:"var(--c-over)", flexShrink:0, fontSize:12, marginTop:3 }}>●</span>
              <span style={{ fontSize:"0.81rem", color:"var(--c-text2)", lineHeight:1.6 }}>{f}</span>
            </div>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {result.suggestions?.length > 0 && (
        <div className="a4 glass" style={{ padding:16, borderRadius:20, marginBottom:16, borderColor:"rgba(0,229,160,0.15)" }}>
          <div className="section-title" style={{ color:"var(--c-emerald)" }}>✦ Suggestions</div>
          {result.suggestions.map((s, i) => (
            <div key={i} style={{ display:"flex", gap:10, padding:"8px 0", borderBottom: i < result.suggestions.length-1 ? "1px solid var(--c-border)" : "none" }}>
              <span style={{ color:"var(--c-emerald)", flexShrink:0, fontSize:12, marginTop:3 }}>●</span>
              <span style={{ fontSize:"0.81rem", color:"var(--c-text2)", lineHeight:1.6 }}>{s}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <button className="btn btn-ghost" onClick={onReset} style={{ borderRadius:14, padding:"13px" }}>← New Scan</button>
        <button className="btn btn-primary" onClick={onChat} style={{ borderRadius:14, padding:"13px" }}>✦ Ask AI</button>
      </div>
    </div>
  );
}