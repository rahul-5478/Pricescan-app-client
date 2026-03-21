import { useState } from "react";

export default function AuthForm({ title, subtitle, fields, submitLabel, onSubmit, footer }) {
  const [values, setValues] = useState(() => Object.fromEntries(fields.map(f => [f.name, ""])));
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const handleSubmit = async () => {
    setError(null); setLoading(true);
    try { await onSubmit(values); }
    catch (e) { setError(e.response?.data?.error || e.response?.data?.message || "Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  const acMap = { password:"current-password", email:"email", name:"name" };

  return (
    <div style={{
      minHeight:"100dvh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"var(--c-bg)", padding:"24px 20px",
      position:"relative", overflow:"hidden",
    }}>
      <div style={{ position:"absolute", top:-100, right:-100, width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle, rgba(0,229,160,0.08) 0%, transparent 70%)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:-100, left:-100, width:350, height:350, borderRadius:"50%", background:"radial-gradient(circle, rgba(124,111,255,0.08) 0%, transparent 70%)", pointerEvents:"none" }} />

      <div style={{ width:"100%", maxWidth:400, position:"relative", zIndex:1 }}>
        {/* Logo */}
        <div className="a1" style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{
            width:72, height:72, borderRadius:22, margin:"0 auto 16px",
            background:"linear-gradient(135deg, var(--c-emerald) 0%, #00A878 100%)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:32, animation:"float 3s ease-in-out infinite",
            boxShadow:"0 8px 40px rgba(0,229,160,0.4), 0 0 0 1px rgba(0,229,160,0.2)",
          }}>⚡</div>
          <div style={{ fontFamily:"var(--f-display)", fontWeight:800, fontSize:"1.8rem", color:"var(--c-text)" }}>
            Price<span style={{ color:"var(--c-emerald)" }}>Scan</span>
          </div>
          <div style={{ fontSize:"0.8rem", color:"var(--c-text3)", marginTop:6 }}>
            AI-Powered Price Intelligence
          </div>
        </div>

        {/* Card */}
        <div className="a2 glass" style={{ padding:"28px 24px", borderRadius:24 }}>
          <div style={{ marginBottom:22 }}>
            <h1 style={{ fontFamily:"var(--f-display)", fontSize:"1.2rem", fontWeight:700, color:"var(--c-text)", marginBottom:4 }}>{title}</h1>
            {subtitle && <p style={{ fontSize:"0.8rem", color:"var(--c-text3)" }}>{subtitle}</p>}
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {fields.map(f => (
              <div key={f.name}>
                <label className="label">{f.label}</label>
                <input
                  className="input"
                  type={f.type || "text"}
                  placeholder={f.placeholder}
                  value={values[f.name]}
                  autoComplete={acMap[f.name] || acMap[f.type] || "off"}
                  onChange={e => setValues(v => ({ ...v, [f.name]: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  onFocus={() => setFocused(f.name)}
                  onBlur={() => setFocused(null)}
                  style={{
                    background: focused === f.name ? "var(--c-surface3)" : "var(--c-surface2)",
                    borderColor: focused === f.name ? "var(--c-emerald)" : "var(--c-border)",
                    boxShadow: focused === f.name ? "0 0 0 3px rgba(0,229,160,0.12)" : "none",
                  }}
                />
              </div>
            ))}
          </div>

          {error && (
            <div style={{
              marginTop:14, padding:"12px 14px", borderRadius:10,
              background:"rgba(255,95,95,0.1)", border:"1px solid rgba(255,95,95,0.25)",
              fontSize:"0.8rem", color:"var(--c-over)", display:"flex", gap:8,
            }}>
              <span>⚠</span><span>{error}</span>
            </div>
          )}

          <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={loading}
            style={{ marginTop:20, padding:"15px", borderRadius:14, fontSize:"0.95rem" }}>
            {loading ? (
              <><div className="spinner" style={{ width:18, height:18, border:"2px solid rgba(7,8,15,0.3)", borderTopColor:"var(--c-bg)" }} />Processing...</>
            ) : submitLabel}
          </button>
        </div>

        {footer && (
          <div className="a3" style={{ marginTop:20, textAlign:"center", fontSize:"0.82rem", color:"var(--c-text3)" }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}