import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const ACTIONS = [
  { path:"/analyze",  icon:"⊙", label:"Scan Price",   color:"#00E5A0", glow:"rgba(0,229,160,0.3)"   },
  { path:"/chat",     icon:"✦", label:"AI Chat",      color:"#7C6FFF", glow:"rgba(124,111,255,0.3)" },
  { path:"/ai-tools", icon:"🧠", label:"AI Tools",    color:"#FF5FA0", glow:"rgba(255,95,160,0.3)"  },
  { path:"/visual",   icon:"📸", label:"Photo Scan",  color:"#FFB547", glow:"rgba(255,181,71,0.3)"  },
  { path:"/niche",    icon:"🎯", label:"Smart Tools", color:"#38C8FF", glow:"rgba(56,200,255,0.3)"  },
  { path:"/wishlist", icon:"💛", label:"Wishlist",    color:"#FFB547", glow:"rgba(255,181,71,0.3)"  },
];

function AnimatedNumber({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    if (!value) return;
    const start = performance.now();
    const animate = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(ease * value));
      if (p < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);
  return display;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/history?page=1&limit=5");
        const list = data.analyses || [];
        setRecent(list);
        const total = data.total || list.length;
        const overpriced = list.filter(a => (a.verdict || a.result?.verdict) === "OVERPRICED").length;
        const savings = list.reduce((s, a) => {
          const v = a.verdict || a.result?.verdict;
          const lp = a.listedPrice;
          const fp = a.estimatedFairPrice || a.result?.estimatedFairPrice;
          if (v === "OVERPRICED" && fp && lp) return s + Math.max(0, lp - fp);
          return s;
        }, 0);
        setStats({ total, overpriced, savings: Math.round(savings) });
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const name = user?.name?.split(" ")[0] || "there";

  return (
    <div style={{ padding:"20px 16px 8px" }}>

      {/* Hero Banner */}
      <div className="a1" style={{
        borderRadius:24, marginBottom:20, overflow:"hidden", position:"relative",
        background:"linear-gradient(135deg, #0D1F1A 0%, #0D1025 50%, #1A0D25 100%)",
        border:"1px solid rgba(0,229,160,0.15)",
        padding:"24px 20px",
        boxShadow:"0 8px 40px rgba(0,0,0,0.4), var(--shadow-glow-e)",
      }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:160, height:160, borderRadius:"50%", background:"radial-gradient(circle, rgba(0,229,160,0.12) 0%, transparent 70%)" }} />
        <div style={{ position:"absolute", bottom:-40, left:-40, width:120, height:120, borderRadius:"50%", background:"radial-gradient(circle, rgba(124,111,255,0.1) 0%, transparent 70%)" }} />
        <div style={{ position:"absolute", inset:0, opacity:0.04, backgroundImage:"linear-gradient(rgba(0,229,160,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,160,1) 1px,transparent 1px)", backgroundSize:"40px 40px" }} />

        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ fontSize:"0.78rem", color:"rgba(0,229,160,0.7)", marginBottom:6 }}>{greeting} 👋</div>
          <div style={{ fontFamily:"var(--f-display)", fontSize:"1.5rem", fontWeight:800, color:"var(--c-text)", marginBottom:6 }}>Hey, {name}!</div>
          <div style={{ fontSize:"0.8rem", color:"var(--c-text2)", marginBottom:20, lineHeight:1.6 }}>
            Check any product's price — AI instantly tells you if it's a good deal or not.
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/analyze")} style={{ padding:"12px 22px", borderRadius:14, fontSize:"0.88rem" }}>
            ⊙ Scan Now →
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="a2" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:20 }}>
        {loading
          ? [1,2,3].map(i => <div key={i} className="skeleton" style={{ height:88, borderRadius:18 }} />)
          : stats ? [
              { label:"Total Scans",  value:stats.total,      suffix:"",  color:"var(--c-emerald)", icon:"⊙" },
              { label:"Overpriced",   value:stats.overpriced, suffix:"",  color:"var(--c-over)",    icon:"⚠" },
              { label:"Saved",        value:stats.savings,    suffix:"₹", color:"var(--c-fair)",    icon:"💰" },
            ].map(s => (
              <div key={s.label} className="glass" style={{ padding:"14px 10px", textAlign:"center", borderRadius:18 }}>
                <div style={{ fontSize:18, marginBottom:6 }}>{s.icon}</div>
                <div style={{ fontFamily:"var(--f-display)", fontSize:"1.25rem", fontWeight:800, color:s.color, lineHeight:1 }}>
                  {s.suffix}<AnimatedNumber value={s.value} />
                </div>
                <div style={{ fontFamily:"var(--f-display)", fontSize:"0.55rem", color:"var(--c-text3)", fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", marginTop:4 }}>{s.label}</div>
              </div>
            )) : null}
      </div>

      {/* Quick Actions */}
      <div className="a3">
        <div className="section-title">Quick Access</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:20 }}>
          {ACTIONS.map(a => (
            <button key={a.path} onClick={() => navigate(a.path)} style={{
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              gap:8, padding:"16px 8px",
              background:"var(--c-surface)", border:"1px solid var(--c-border)",
              borderRadius:18, cursor:"pointer", transition:"all 0.2s",
            }}
            onTouchStart={e => { e.currentTarget.style.transform="scale(0.95)"; e.currentTarget.style.borderColor=a.color+"50"; }}
            onTouchEnd={e => { e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.borderColor="var(--c-border)"; }}
            >
              <div style={{ width:44, height:44, borderRadius:14, fontSize:20, background:`${a.color}15`, border:`1px solid ${a.color}25`, display:"flex", alignItems:"center", justifyContent:"center", color:a.color }}>{a.icon}</div>
              <span style={{ fontFamily:"var(--f-display)", fontSize:"0.65rem", fontWeight:700, color:"var(--c-text2)", textAlign:"center" }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Scans */}
      <div className="a4">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <div className="section-title" style={{ margin:0 }}>Recent Scans</div>
          <button onClick={() => navigate("/history")} style={{ fontFamily:"var(--f-display)", fontSize:"0.7rem", fontWeight:700, color:"var(--c-emerald)", background:"none", border:"none", cursor:"pointer" }}>See all →</button>
        </div>

        {loading && [1,2,3].map(i => <div key={i} className="skeleton" style={{ height:68, borderRadius:16, marginBottom:8 }} />)}

        {!loading && recent.length === 0 && (
          <div className="glass" style={{ textAlign:"center", padding:"36px 20px", borderRadius:20 }}>
            <div style={{ fontSize:36, marginBottom:10, opacity:0.4 }}>⊙</div>
            <div style={{ fontFamily:"var(--f-display)", fontSize:"0.85rem", color:"var(--c-text3)" }}>No scans yet</div>
            <button className="btn btn-primary" onClick={() => navigate("/analyze")} style={{ marginTop:16, padding:"10px 22px", fontSize:"0.82rem", borderRadius:12 }}>
              Start Scanning
            </button>
          </div>
        )}

        {!loading && recent.map((a, i) => {
          const verdict = a.verdict || a.result?.verdict || "UNKNOWN";
          const vc = { OVERPRICED:["var(--c-over)","⚠"], FAIR:["var(--c-fair)","✓"], UNDERPRICED:["var(--c-under)","↓"], UNKNOWN:["var(--c-text3)","?"] };
          const [color, icon] = vc[verdict] || vc.UNKNOWN;
          return (
            <div key={a._id || i} className="glass" style={{ marginBottom:8, display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:16, animation:`fadeUp 0.4s ${i*0.06}s both` }}>
              <div style={{ width:40, height:40, borderRadius:12, flexShrink:0, background:`${color}15`, border:`1px solid ${color}25`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, color, fontFamily:"var(--f-display)" }}>{icon}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:"var(--f-display)", fontSize:"0.85rem", fontWeight:600, color:"var(--c-text)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.productName}</div>
                <div style={{ fontSize:"0.7rem", color:"var(--c-text3)", marginTop:2 }}>{a.category} · {a.currency || "₹"}{a.listedPrice?.toLocaleString()}</div>
              </div>
              <div style={{ padding:"4px 10px", borderRadius:99, flexShrink:0, background:`${color}15`, border:`1px solid ${color}25`, fontFamily:"var(--f-display)", fontSize:"0.6rem", fontWeight:700, color, letterSpacing:"0.06em", textTransform:"uppercase" }}>{verdict}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}