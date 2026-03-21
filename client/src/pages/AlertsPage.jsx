import { useState, useEffect } from "react";
import CyberPanel from "../components/CyberPanel";
import CyberButton from "../components/CyberButton";

// Alerts are stored in localStorage (no backend needed for MVP)
const STORAGE_KEY = "pricescan_alerts";

function loadAlerts() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function saveAlerts(alerts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
}

const inp = {
  width:"100%", background:"var(--surface2)", border:"1px solid var(--border2)",
  color:"var(--text)", padding:"9px 12px", outline:"none", fontSize:"0.82rem", transition:"all 150ms",
};
const onF = e => { e.target.style.borderColor="var(--cyan)"; e.target.style.boxShadow="0 0 0 1px rgba(0,229,255,0.12)"; };
const onB = e => { e.target.style.borderColor="var(--border2)"; e.target.style.boxShadow="none"; };

export default function AlertsPage() {
  const [alerts, setAlerts]   = useState(loadAlerts);
  const [form, setForm]       = useState({ productName:"", targetPrice:"", currency:"USD", email:"" });
  const [saved, setSaved]     = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const addAlert = (e) => {
    e.preventDefault();
    const alert = {
      id: Date.now(),
      ...form,
      targetPrice: parseFloat(form.targetPrice),
      createdAt: new Date().toISOString(),
      active: true,
    };
    const updated = [alert, ...alerts];
    setAlerts(updated);
    saveAlerts(updated);
    setForm({ productName:"", targetPrice:"", currency:"USD", email:"" });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const deleteAlert = (id) => {
    const updated = alerts.filter(a => a.id !== id);
    setAlerts(updated);
    saveAlerts(updated);
  };

  const toggleAlert = (id) => {
    const updated = alerts.map(a => a.id === id ? { ...a, active: !a.active } : a);
    setAlerts(updated);
    saveAlerts(updated);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div className="animate-fade-up">
        <div style={{ fontSize:"0.58rem", color:"var(--text3)", letterSpacing:"0.2em", marginBottom:4 }}>MODULE_04</div>
        <h1 style={{ fontSize:"1.5rem", color:"var(--cyan)", textShadow:"var(--glow-cyan)" }}>
          PRICE <span style={{ color:"var(--text)" }}>ALERTS</span>
        </h1>
        <div style={{ width:36, height:2, background:"var(--cyan)", marginTop:8, boxShadow:"var(--glow-cyan)" }} />
      </div>

      {/* Notice */}
      <div style={{
        border:"1px solid rgba(255,229,0,0.2)", background:"rgba(255,229,0,0.04)",
        padding:"10px 14px", fontSize:"0.68rem", color:"var(--yellow)",
        display:"flex", gap:8, alignItems:"flex-start",
      }}>
        <span>⚠</span>
        <span>Alert emails require a backend email service (Nodemailer/SendGrid). Alerts are saved locally and can be connected to your server's cron job to send notifications.</span>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, alignItems:"start" }}>
        {/* Create alert form */}
        <CyberPanel className="animate-fade-up-2">
          <div style={{ fontSize:"0.58rem", color:"var(--text3)", letterSpacing:"0.18em", marginBottom:16 }}>CREATE ALERT</div>

          <form onSubmit={addAlert} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {[
              { key:"productName", label:"PRODUCT NAME", placeholder:"e.g. Sony WH-1000XM5" },
              { key:"email",       label:"EMAIL ADDRESS",  placeholder:"you@example.com", type:"email" },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display:"block", fontSize:"0.58rem", color:"var(--text3)", letterSpacing:"0.15em", marginBottom:5 }}>{">"} {f.label} *</label>
                <input style={inp} onFocus={onF} onBlur={onB} required
                  type={f.type || "text"} placeholder={f.placeholder}
                  value={form[f.key]} onChange={set(f.key)} />
              </div>
            ))}

            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:10 }}>
              <div>
                <label style={{ display:"block", fontSize:"0.58rem", color:"var(--text3)", letterSpacing:"0.15em", marginBottom:5 }}>{">"} TARGET PRICE *</label>
                <input style={inp} onFocus={onF} onBlur={onB} required
                  type="number" min="0.01" step="0.01" placeholder="249.99"
                  value={form.targetPrice} onChange={set("targetPrice")} />
              </div>
              <div>
                <label style={{ display:"block", fontSize:"0.58rem", color:"var(--text3)", letterSpacing:"0.15em", marginBottom:5 }}>{">"} CURRENCY</label>
                <select style={{ ...inp, cursor:"crosshair" }} onFocus={onF} onBlur={onB}
                  value={form.currency} onChange={set("currency")}>
                  {["USD","EUR","GBP","INR","JPY"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <p style={{ fontSize:"0.65rem", color:"var(--text3)", lineHeight:1.6 }}>
              You'll be notified when our AI detects the product price drops to or below your target.
            </p>

            {saved && (
              <div style={{ background:"rgba(0,255,136,0.08)", border:"1px solid rgba(0,255,136,0.3)", padding:"8px 12px", fontSize:"0.72rem", color:"var(--green)" }}>
                ✓ Alert saved successfully
              </div>
            )}

            <button type="submit" style={{
              padding:"11px", background:"rgba(0,229,255,0.07)",
              border:"1px solid var(--cyan)", color:"var(--cyan)",
              fontSize:"0.7rem", letterSpacing:"0.18em",
              fontFamily:"var(--font-head)", fontWeight:700,
              boxShadow:"var(--glow-cyan)", transition:"all 150ms",
            }}>
              {">"} SET ALERT
            </button>
          </form>
        </CyberPanel>

        {/* Active alerts list */}
        <CyberPanel accent="magenta" className="animate-fade-up-3">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ fontSize:"0.58rem", color:"var(--text3)", letterSpacing:"0.18em" }}>ACTIVE ALERTS</div>
            <span style={{
              background:"rgba(0,229,255,0.1)", border:"1px solid rgba(0,229,255,0.2)",
              color:"var(--cyan)", padding:"2px 8px", fontSize:"0.6rem", letterSpacing:"0.1em",
            }}>{alerts.length}</span>
          </div>

          {alerts.length === 0 ? (
            <div style={{ textAlign:"center", padding:"32px 0", color:"var(--text3)" }}>
              <div style={{ fontSize:28, opacity:0.2, marginBottom:8 }}>◎</div>
              <div style={{ fontSize:"0.68rem", letterSpacing:"0.1em" }}>No alerts configured</div>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10, maxHeight:400, overflowY:"auto" }}>
              {alerts.map(alert => (
                <div key={alert.id} style={{
                  background:"var(--surface2)", border:`1px solid ${alert.active ? "var(--border2)" : "var(--border)"}`,
                  padding:"12px 14px", opacity: alert.active ? 1 : 0.5,
                  transition:"all 150ms",
                }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:"0.78rem", color: alert.active ? "var(--text)" : "var(--text3)", marginBottom:4, fontWeight:600 }}>
                        {alert.productName}
                      </div>
                      <div style={{ fontSize:"0.65rem", color:"var(--text3)", display:"flex", gap:12, flexWrap:"wrap" }}>
                        <span>Target: <span style={{ color:"var(--cyan)" }}>{alert.currency} {alert.targetPrice?.toLocaleString()}</span></span>
                        <span>→ {alert.email}</span>
                      </div>
                      <div style={{ fontSize:"0.58rem", color:"var(--text3)", marginTop:4 }}>
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                      <button onClick={() => toggleAlert(alert.id)} style={{
                        padding:"3px 8px", fontSize:"0.6rem",
                        background:"transparent",
                        border:`1px solid ${alert.active ? "var(--green)" : "var(--border2)"}`,
                        color: alert.active ? "var(--green)" : "var(--text3)",
                        cursor:"crosshair", transition:"all 150ms",
                      }}>
                        {alert.active ? "ON" : "OFF"}
                      </button>
                      <button onClick={() => deleteAlert(alert.id)} style={{
                        padding:"3px 8px", fontSize:"0.6rem",
                        background:"transparent", border:"1px solid var(--border2)",
                        color:"var(--text3)", cursor:"crosshair", transition:"all 150ms",
                      }}
                      onMouseEnter={e => { e.target.style.borderColor="var(--red)"; e.target.style.color="var(--red)"; }}
                      onMouseLeave={e => { e.target.style.borderColor="var(--border2)"; e.target.style.color="var(--text3)"; }}>
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CyberPanel>
      </div>

      {/* Backend integration note */}
      <CyberPanel className="animate-fade-up-4" style={{ borderLeft:"2px solid var(--yellow)" }}>
        <div style={{ fontSize:"0.58rem", color:"var(--yellow)", letterSpacing:"0.18em", marginBottom:10 }}>
          ◈ BACKEND INTEGRATION GUIDE
        </div>
        <p style={{ fontSize:"0.72rem", color:"var(--text3)", lineHeight:1.8 }}>
          To send real emails, add <span style={{ color:"var(--cyan)" }}>POST /api/alerts</span> to Express,
          store alerts in MongoDB, and set up a cron job that calls Claude to re-analyze products and emails via{" "}
          <span style={{ color:"var(--cyan)" }}>nodemailer</span> or{" "}
          <span style={{ color:"var(--cyan)" }}>@sendgrid/mail</span> when the fair price drops below target.
        </p>
      </CyberPanel>
    </div>
  );
}
