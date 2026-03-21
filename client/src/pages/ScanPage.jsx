import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Btn, Badge, SectionHeader, Spinner } from "../components/UI";
import api from "../services/api";

const CATEGORIES = ["Electronics","Fashion","Home & Kitchen","Books","Beauty","Sports","Toys","Grocery","Automotive","Other"];
const CURRENCIES  = ["INR","USD","EUR","GBP","AED","SGD","JPY"];
const MARKETS     = ["Amazon","Flipkart","Meesho","Myntra","Nykaa","Snapdeal","Croma","Offline Store","Other"];

const VERDICT_CONFIG = {
  OVERPRICED:  { color:"var(--danger)",  bg:"var(--danger-bg)",  icon:"⚠️", label:"Overpriced",  badge:"danger"  },
  FAIR:        { color:"var(--success)", bg:"var(--success-bg)", icon:"✅", label:"Fair Price",  badge:"success" },
  UNDERPRICED: { color:"var(--info)",    bg:"var(--info-bg)",    icon:"🔽", label:"Underpriced", badge:"info"    },
  UNKNOWN:     { color:"var(--text3)",   bg:"var(--bg2)",        icon:"❓", label:"Unknown",     badge:"gray"    },
};

const labelStyle = {
  display:"block", fontSize:"0.82rem", fontWeight:600,
  color:"var(--text2)", marginBottom:6,
};

const inputStyle = {
  width:"100%", padding:"12px 14px",
  border:"1.5px solid var(--border)", borderRadius:10,
  fontSize:"0.95rem", outline:"none", color:"var(--text)",
  background:"var(--bg)", transition:"all 150ms",
  fontFamily:"var(--font-body)",
};

export default function ScanPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    productName:"", category:"Electronics", listedPrice:"",
    currency:"INR", marketplace:"Amazon", description:"",
  });
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState(null);
  const [advanced, setAdvanced] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleScan = async () => {
    if (!form.productName.trim() || !form.listedPrice) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const { data } = await api.post("/analyze", {
        ...form, listedPrice: parseFloat(form.listedPrice),
      });
      setResult(data);
    } catch (e) {
      setError(e.response?.data?.error || "Analysis failed. Please try again.");
    } finally { setLoading(false); }
  };

  const reset = () => {
    setResult(null); setError(null);
    setForm({ productName:"", category:"Electronics", listedPrice:"", currency:"INR", marketplace:"Amazon", description:"" });
  };

  if (result) return <ResultView result={result} form={form} onReset={reset} navigate={navigate} />;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <SectionHeader title="Price Scanner" subtitle="Enter product details — AI will analyze the price" icon="⚡" />

      <Card className="animate-fade-up" style={{ padding:"20px" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

          <div>
            <label style={labelStyle}>Product Name *</label>
            <input
              style={inputStyle}
              placeholder="e.g. Sony WH-1000XM5 Headphones"
              value={form.productName}
              onChange={e => set("productName", e.target.value)}
              onFocus={e => { e.target.style.borderColor="var(--primary)"; e.target.style.boxShadow="0 0 0 3px rgba(99,102,241,0.12)"; }}
              onBlur={e  => { e.target.style.borderColor="var(--border)";  e.target.style.boxShadow="none"; }}
            />
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={labelStyle}>Listed Price *</label>
              <input
                style={inputStyle} type="number" placeholder="0.00"
                value={form.listedPrice}
                onChange={e => set("listedPrice", e.target.value)}
                onFocus={e => { e.target.style.borderColor="var(--primary)"; e.target.style.boxShadow="0 0 0 3px rgba(99,102,241,0.12)"; }}
                onBlur={e  => { e.target.style.borderColor="var(--border)";  e.target.style.boxShadow="none"; }}
              />
            </div>
            <div>
              <label style={labelStyle}>Currency</label>
              <select style={inputStyle} value={form.currency} onChange={e => set("currency", e.target.value)}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Category</label>
            <select style={inputStyle} value={form.category} onChange={e => set("category", e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Advanced toggle */}
          <button onClick={() => setAdvanced(!advanced)} style={{
            display:"flex", alignItems:"center", gap:6,
            background:"none", border:"none", cursor:"pointer",
            color:"var(--text3)", fontSize:"0.78rem", fontWeight:600, padding:0,
          }}>
            <span style={{ display:"inline-block", transform: advanced?"rotate(90deg)":"none", transition:"0.15s" }}>▶</span>
            Advanced Options
          </button>

          {advanced && (
            <div style={{ display:"flex", flexDirection:"column", gap:14, paddingTop:4 }}>
              <div>
                <label style={labelStyle}>Marketplace</label>
                <select style={inputStyle} value={form.marketplace} onChange={e => set("marketplace", e.target.value)}>
                  {MARKETS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Description (optional)</label>
                <textarea
                  style={{ ...inputStyle, resize:"none" }} rows={3}
                  placeholder="Add any extra details about the product..."
                  value={form.description}
                  onChange={e => set("description", e.target.value)}
                  onFocus={e => { e.target.style.borderColor="var(--primary)"; e.target.style.boxShadow="0 0 0 3px rgba(99,102,241,0.12)"; }}
                  onBlur={e  => { e.target.style.borderColor="var(--border)";  e.target.style.boxShadow="none"; }}
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {error && (
        <div style={{
          background:"var(--danger-bg)", border:"1px solid #fecaca",
          borderRadius:12, padding:"12px 16px",
          fontSize:"0.82rem", color:"var(--danger)", display:"flex", gap:8,
        }}>
          <span>⚠️</span><span>{error}</span>
        </div>
      )}

      <button
        className="animate-fade-up-2"
        onClick={handleScan}
        disabled={loading || !form.productName.trim() || !form.listedPrice}
        style={{
          padding:"15px", borderRadius:12, border:"none",
          background: (!form.productName.trim() || !form.listedPrice || loading)
            ? "var(--text3)"
            : "linear-gradient(135deg, var(--primary), #8b5cf6)",
          color:"white", fontWeight:700, fontSize:"1rem",
          boxShadow: (!form.productName.trim() || !form.listedPrice || loading)
            ? "none" : "0 4px 20px rgba(99,102,241,0.35)",
          transition:"all 150ms", cursor: loading ? "not-allowed" : "pointer",
          display:"flex", alignItems:"center", justifyContent:"center", gap:10,
        }}
      >
        {loading
          ? <><Spinner size={18} color="white" /> Analyzing...</>
          : "⚡ Analyze Price"
        }
      </button>
    </div>
  );
}

function ResultView({ result, form, onReset, navigate }) {
  const cfg = VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG.UNKNOWN;
  const saving = result.verdict === "OVERPRICED" && result.estimatedFairPrice
    ? parseFloat(form.listedPrice) - result.estimatedFairPrice : 0;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

      {/* Verdict banner */}
      <div className="animate-fade-up" style={{
        background: cfg.bg, border:`1.5px solid ${cfg.color}33`,
        borderRadius:20, padding:"24px 20px", textAlign:"center",
      }}>
        <div style={{ fontSize:48, marginBottom:10 }}>{cfg.icon}</div>
        <div style={{ fontSize:"1.8rem", fontWeight:800, color:cfg.color, marginBottom:6 }}>{cfg.label}</div>
        <div style={{ fontSize:"0.85rem", color:"var(--text2)", lineHeight:1.6 }}>{result.marketComparison}</div>
      </div>

      {/* Price comparison */}
      <Card className="animate-fade-up-2" style={{ padding:"18px" }}>
        <p style={{ fontSize:"0.7rem", fontWeight:700, color:"var(--text3)", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:12 }}>Price Breakdown</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div style={{ textAlign:"center", padding:"14px", background:"var(--bg2)", borderRadius:12 }}>
            <div style={{ fontSize:"0.62rem", color:"var(--text3)", fontWeight:700, letterSpacing:"0.08em", marginBottom:4 }}>LISTED PRICE</div>
            <div style={{ fontSize:"1.4rem", fontWeight:800, color:"var(--text)" }}>
              {form.currency} {parseFloat(form.listedPrice).toLocaleString()}
            </div>
          </div>
          <div style={{ textAlign:"center", padding:"14px", background:cfg.bg, borderRadius:12 }}>
            <div style={{ fontSize:"0.62rem", color:"var(--text3)", fontWeight:700, letterSpacing:"0.08em", marginBottom:4 }}>FAIR PRICE</div>
            <div style={{ fontSize:"1.4rem", fontWeight:800, color:cfg.color }}>
              {form.currency} {result.estimatedFairPrice?.toLocaleString()}
            </div>
          </div>
        </div>

        {saving > 0 && (
          <div style={{
            marginTop:12, background:"var(--success-bg)", borderRadius:10,
            padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center",
          }}>
            <span style={{ fontSize:"0.82rem", color:"var(--text2)" }}>Potential Savings</span>
            <span style={{ fontWeight:800, color:"var(--success)", fontSize:"1rem" }}>
              {form.currency} {Math.round(saving).toLocaleString()}
            </span>
          </div>
        )}
      </Card>

      {/* Confidence */}
      <Card className="animate-fade-up-3" style={{ padding:"18px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <p style={{ fontSize:"0.7rem", fontWeight:700, color:"var(--text3)", letterSpacing:"0.08em", textTransform:"uppercase" }}>Confidence Score</p>
          <span style={{ fontWeight:800, color:"var(--primary)", fontSize:"0.95rem" }}>{result.confidenceScore}%</span>
        </div>
        <div style={{ height:8, borderRadius:4, background:"var(--bg2)", overflow:"hidden" }}>
          <div style={{
            height:"100%", borderRadius:4,
            background:"linear-gradient(90deg, var(--primary), #8b5cf6)",
            width:`${result.confidenceScore}%`, transition:"width 0.8s ease",
          }} />
        </div>
      </Card>

      {/* Reasoning */}
      {result.reasoning && (
        <Card className="animate-fade-up-4" style={{ padding:"18px" }}>
          <p style={{ fontSize:"0.7rem", fontWeight:700, color:"var(--text3)", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>Analysis</p>
          <p style={{ fontSize:"0.88rem", color:"var(--text2)", lineHeight:1.7 }}>{result.reasoning}</p>
        </Card>
      )}

      {/* Red Flags */}
      {result.redFlags?.length > 0 && (
        <Card style={{ padding:"18px" }}>
          <p style={{ fontSize:"0.7rem", fontWeight:700, color:"var(--danger)", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>⚠️ Red Flags</p>
          {result.redFlags.map((f, i) => (
            <div key={i} style={{
              display:"flex", gap:10, padding:"8px 0",
              borderBottom: i < result.redFlags.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              <span style={{ color:"var(--danger)", flexShrink:0 }}>•</span>
              <span style={{ fontSize:"0.85rem", color:"var(--text2)" }}>{f}</span>
            </div>
          ))}
        </Card>
      )}

      {/* Suggestions */}
      {result.suggestions?.length > 0 && (
        <Card style={{ padding:"18px" }}>
          <p style={{ fontSize:"0.7rem", fontWeight:700, color:"var(--success)", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>💡 Suggestions</p>
          {result.suggestions.map((s, i) => (
            <div key={i} style={{
              display:"flex", gap:10, padding:"8px 0",
              borderBottom: i < result.suggestions.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              <span style={{ color:"var(--success)", flexShrink:0 }}>✓</span>
              <span style={{ fontSize:"0.85rem", color:"var(--text2)" }}>{s}</span>
            </div>
          ))}
        </Card>
      )}

      {/* Actions */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, paddingBottom:8 }}>
        <button onClick={onReset} style={{
          padding:"13px", borderRadius:10, border:"1.5px solid var(--border)",
          background:"white", color:"var(--text2)", fontWeight:600, fontSize:"0.9rem",
          cursor:"pointer", transition:"all 150ms",
        }}>← New Scan</button>
        <button onClick={() => navigate("/chat")} style={{
          padding:"13px", borderRadius:10, border:"none",
          background:"linear-gradient(135deg, var(--primary), #8b5cf6)",
          color:"white", fontWeight:700, fontSize:"0.9rem",
          cursor:"pointer", boxShadow:"0 4px 16px rgba(99,102,241,0.3)",
          transition:"all 150ms",
        }}>Ask AI 🤖</button>
      </div>
    </div>
  );
}