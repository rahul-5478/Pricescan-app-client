import { useState, useEffect } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { path:"/dashboard", icon:"⊞", label:"Home"    },
  { path:"/analyze",   icon:"⊙", label:"Scan"    },
  { path:"/chat",      icon:"✦", label:"AI"      },
  { path:"/insights",  icon:"◈", label:"Insights" },
  { path:"/history",   icon:"☰", label:"History" },
];

const DRAWER_ITEMS = [
  { path:"/ai-tools",  icon:"🧠", label:"AI Tools",       desc:"Seller psychology, fake discounts",  color:"#7C6FFF" },
  { path:"/visual",    icon:"📸", label:"Visual Scan",    desc:"Screenshot & receipt analyzer",      color:"#FF5FA0" },
  { path:"/social",    icon:"🤝", label:"Social Tools",   desc:"Negotiation scripts & community",    color:"#00E5A0" },
  { path:"/niche",     icon:"🎯", label:"Smart Tools",    desc:"EMI traps, auctions, arbitrage",     color:"#FFB547" },
  { path:"/wishlist",  icon:"💛", label:"Wishlist",       desc:"Save & track price drops",           color:"#FFB547" },
  { path:"/alerts",    icon:"🔔", label:"Alerts",         desc:"Get notified on price drops",        color:"#38C8FF" },
  { path:"/bulk",      icon:"📦", label:"Bulk Scan",      desc:"Analyze CSV of products",            color:"#7C6FFF" },
];

const PAGE_TITLES = {
  "/dashboard":"Home", "/analyze":"Price Scanner", "/chat":"AI Assistant",
  "/insights":"Insights", "/history":"History", "/ai-tools":"AI Tools",
  "/visual":"Visual Scan", "/social":"Social Tools", "/niche":"Smart Tools",
  "/wishlist":"Wishlist", "/alerts":"Alerts", "/bulk":"Bulk Scan",
};

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const title = PAGE_TITLES[location.pathname] || "PriceScan";
  const isActive = (p) => location.pathname === p;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive:true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => { setDrawerOpen(false); }, [location]);

  return (
    <div style={{ maxWidth:480, margin:"0 auto", minHeight:"100dvh", background:"var(--c-bg)", position:"relative" }}>

      {/* Ambient blobs */}
      <div style={{ position:"fixed", top:0, left:"50%", transform:"translateX(-50%)", width:480, height:"100dvh", pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-100, right:-60, width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle, rgba(0,229,160,0.06) 0%, transparent 70%)" }} />
        <div style={{ position:"absolute", top:200, left:-80, width:250, height:250, borderRadius:"50%", background:"radial-gradient(circle, rgba(124,111,255,0.06) 0%, transparent 70%)" }} />
        <div style={{ position:"absolute", bottom:200, right:-60, width:200, height:200, borderRadius:"50%", background:"radial-gradient(circle, rgba(56,200,255,0.04) 0%, transparent 70%)" }} />
      </div>

      {/* Header */}
      <header style={{
        position:"fixed", top:0, left:"50%", transform:"translateX(-50%)",
        width:"100%", maxWidth:480, zIndex:100,
        paddingTop:"var(--safe-t)", height:"var(--header-h)",
        background: scrolled ? "rgba(7,8,15,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        borderBottom: scrolled ? "1px solid var(--c-border)" : "1px solid transparent",
        transition:"all 0.3s ease",
      }}>
        <div style={{ height:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              width:36, height:36, borderRadius:12, fontSize:18,
              background:"linear-gradient(135deg, var(--c-emerald) 0%, #00A878 100%)",
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 4px 16px rgba(0,229,160,0.4)",
            }}>⚡</div>
            <div>
              <div style={{ fontFamily:"var(--f-display)", fontWeight:800, fontSize:"1.05rem", color:"var(--c-text)", lineHeight:1 }}>
                Price<span style={{ color:"var(--c-emerald)" }}>Scan</span>
              </div>
              <div style={{ fontSize:"0.55rem", color:"var(--c-text3)", letterSpacing:"0.12em", textTransform:"uppercase" }}>{title}</div>
            </div>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:99,
              background:"rgba(0,229,160,0.1)", border:"1px solid rgba(0,229,160,0.2)",
            }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"var(--c-emerald)", animation:"pulse 2s infinite" }} />
              <span style={{ fontFamily:"var(--f-display)", fontSize:"0.62rem", fontWeight:700, color:"var(--c-emerald)" }}>AI ONLINE</span>
            </div>
            <div onClick={() => setDrawerOpen(true)} style={{
              width:36, height:36, borderRadius:12, cursor:"pointer",
              background:"linear-gradient(135deg, var(--c-violet), var(--c-rose))",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontFamily:"var(--f-display)", fontWeight:700, color:"#fff", fontSize:"0.85rem",
              boxShadow:"0 4px 16px rgba(124,111,255,0.4)", transition:"transform 0.15s",
            }}
            onTouchStart={e => e.currentTarget.style.transform="scale(0.9)"}
            onTouchEnd={e => e.currentTarget.style.transform="scale(1)"}
            >{user?.name?.[0]?.toUpperCase() || "U"}</div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ position:"relative", zIndex:1, paddingTop:"var(--header-h)", paddingBottom:"calc(var(--nav-h) + var(--safe-b) + 8px)" }}>
        <Outlet />
      </main>

      {/* Bottom Nav */}
      <nav style={{
        position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
        width:"100%", maxWidth:480, zIndex:100,
        background:"rgba(7,8,15,0.92)", backdropFilter:"blur(24px)",
        borderTop:"1px solid var(--c-border)",
        paddingBottom:"var(--safe-b)", height:"var(--nav-h)",
        display:"grid", gridTemplateColumns:"repeat(5,1fr)",
      }}>
        {NAV.map(item => {
          const active = isActive(item.path);
          return (
            <button key={item.path} onClick={() => navigate(item.path)} style={{
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              gap:4, background:"transparent", border:"none", cursor:"pointer",
              padding:"8px 4px", position:"relative",
            }}>
              {active && (
                <div style={{
                  position:"absolute", top:0, left:"50%", transform:"translateX(-50%)",
                  width:32, height:2.5, borderRadius:"0 0 4px 4px",
                  background:"linear-gradient(90deg, var(--c-emerald), var(--c-violet))",
                  boxShadow:"0 0 12px rgba(0,229,160,0.6)",
                }} />
              )}
              <div style={{
                width:32, height:32, borderRadius:10,
                display:"flex", alignItems:"center", justifyContent:"center",
                background: active ? "rgba(0,229,160,0.1)" : "transparent",
                border: active ? "1px solid rgba(0,229,160,0.2)" : "1px solid transparent",
                fontSize:16, color: active ? "var(--c-emerald)" : "var(--c-text3)",
                transition:"all 0.2s",
                boxShadow: active ? "0 0 20px rgba(0,229,160,0.2)" : "none",
              }}>{item.icon}</div>
              <span style={{
                fontFamily:"var(--f-display)", fontSize:"0.55rem", fontWeight: active ? 700 : 500,
                color: active ? "var(--c-emerald)" : "var(--c-text3)",
                letterSpacing:"0.04em", transition:"color 0.15s",
              }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Side Drawer */}
      {drawerOpen && (
        <>
          <div onClick={() => setDrawerOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:200, animation:"fadeIn 0.2s ease", backdropFilter:"blur(4px)" }} />
          <div style={{
            position:"fixed", top:0, right:0, width:300, height:"100dvh",
            background:"var(--c-surface)", zIndex:201,
            animation:"slideIn 0.3s cubic-bezier(0.16,1,0.3,1)",
            borderLeft:"1px solid var(--c-border)",
            display:"flex", flexDirection:"column",
            paddingTop:"var(--safe-t)",
          }}>
            {/* Drawer header */}
            <div style={{
              padding:"20px 20px 16px",
              background:"linear-gradient(135deg, rgba(0,229,160,0.08), rgba(124,111,255,0.08))",
              borderBottom:"1px solid var(--c-border)",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                <div style={{
                  width:44, height:44, borderRadius:14,
                  background:"linear-gradient(135deg, var(--c-violet), var(--c-rose))",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontFamily:"var(--f-display)", fontWeight:800, color:"#fff", fontSize:"1rem",
                }}>{user?.name?.[0]?.toUpperCase()}</div>
                <div>
                  <div style={{ fontFamily:"var(--f-display)", fontWeight:700, fontSize:"0.95rem", color:"var(--c-text)" }}>{user?.name}</div>
                  <div style={{ fontSize:"0.72rem", color:"var(--c-text3)" }}>{user?.email}</div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div style={{ flex:1, overflowY:"auto", padding:"12px" }}>
              <div className="section-title" style={{ padding:"4px 8px" }}>All Features</div>
              {DRAWER_ITEMS.map(item => (
                <button key={item.path} onClick={() => { navigate(item.path); setDrawerOpen(false); }} style={{
                  width:"100%", display:"flex", alignItems:"center", gap:12,
                  padding:"10px 12px", borderRadius:14, cursor:"pointer",
                  background: location.pathname === item.path ? `${item.color}10` : "transparent",
                  border:`1px solid ${location.pathname === item.path ? item.color+"30" : "transparent"}`,
                  marginBottom:4, transition:"all 0.15s",
                }}>
                  <div style={{
                    width:38, height:38, borderRadius:10, flexShrink:0,
                    background:`${item.color}15`, border:`1px solid ${item.color}20`,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
                  }}>{item.icon}</div>
                  <div style={{ textAlign:"left" }}>
                    <div style={{ fontFamily:"var(--f-display)", fontSize:"0.82rem", fontWeight:600, color:"var(--c-text)" }}>{item.label}</div>
                    <div style={{ fontSize:"0.65rem", color:"var(--c-text3)", marginTop:1 }}>{item.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            <div style={{ padding:"16px", borderTop:"1px solid var(--c-border)" }}>
              <button className="btn btn-ghost btn-full" onClick={logout} style={{ borderRadius:12 }}>Sign Out</button>
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes slideIn { from { transform:translateX(100%); } to { transform:translateX(0); } }`}</style>
    </div>
  );
}