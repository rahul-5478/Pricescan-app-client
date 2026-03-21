import { useState, useEffect } from "react";

export default function SplashScreen({ onFinish }) {
  const [phase, setPhase] = useState("enter"); // enter → show → exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("show"), 100);
    const t2 = setTimeout(() => setPhase("exit"), 2200);
    const t3 = setTimeout(() => onFinish?.(), 2700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      background:"linear-gradient(135deg, #07080F 0%, #0D1025 50%, #07080F 100%)",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      opacity: phase === "exit" ? 0 : 1,
      transform: phase === "exit" ? "scale(1.05)" : "scale(1)",
      transition: "opacity 0.5s ease, transform 0.5s ease",
      overflow:"hidden",
    }}>

      {/* Background grid */}
      <div style={{
        position:"absolute", inset:0, opacity:0.04,
        backgroundImage:"linear-gradient(rgba(0,229,160,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,160,1) 1px, transparent 1px)",
        backgroundSize:"40px 40px",
      }} />

      {/* Ambient blobs */}
      <div style={{ position:"absolute", top:"15%", right:"10%", width:200, height:200, borderRadius:"50%", background:"radial-gradient(circle, rgba(0,229,160,0.12) 0%, transparent 70%)" }} />
      <div style={{ position:"absolute", bottom:"20%", left:"5%", width:160, height:160, borderRadius:"50%", background:"radial-gradient(circle, rgba(124,111,255,0.1) 0%, transparent 70%)" }} />

      {/* Logo container */}
      <div style={{
        display:"flex", flexDirection:"column", alignItems:"center",
        opacity: phase === "enter" ? 0 : 1,
        transform: phase === "enter" ? "translateY(30px) scale(0.8)" : "translateY(0) scale(1)",
        transition: "opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)",
      }}>

        {/* App Icon */}
        <div style={{
          width:96, height:96, borderRadius:28,
          background:"linear-gradient(135deg, #00E5A0 0%, #00A878 100%)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:44,
          boxShadow:"0 0 0 1px rgba(0,229,160,0.3), 0 8px 40px rgba(0,229,160,0.4), 0 0 80px rgba(0,229,160,0.2)",
          marginBottom:24,
          animation: phase === "show" ? "iconPulse 2s ease-in-out infinite" : "none",
        }}>
          ⚡
        </div>

        {/* App name */}
        <div style={{
          fontFamily:"'Sora', sans-serif", fontWeight:800,
          fontSize:"2rem", color:"#F0F2FF", letterSpacing:"-0.02em",
          lineHeight:1,
        }}>
          Price<span style={{ color:"#00E5A0" }}>Scan</span>
        </div>

        {/* Tagline */}
        <div style={{
          fontFamily:"'DM Sans', sans-serif", fontSize:"0.82rem",
          color:"rgba(139,144,180,0.8)", marginTop:8, letterSpacing:"0.04em",
          opacity: phase === "show" ? 1 : 0,
          transition:"opacity 0.4s 0.3s ease",
        }}>
          AI-Powered Price Intelligence
        </div>

        {/* Loading dots */}
        <div style={{
          display:"flex", gap:8, marginTop:40,
          opacity: phase === "show" ? 1 : 0,
          transition:"opacity 0.4s 0.5s ease",
        }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width:6, height:6, borderRadius:"50%",
              background:"#00E5A0", opacity:0.4,
              animation:"dotPulse 1.4s ease-in-out infinite",
              animationDelay:`${i * 0.2}s`,
            }} />
          ))}
        </div>
      </div>

      {/* Version tag */}
      <div style={{
        position:"absolute", bottom:48,
        fontFamily:"'JetBrains Mono', monospace", fontSize:"0.65rem",
        color:"rgba(74,79,110,0.8)", letterSpacing:"0.1em",
        opacity: phase === "show" ? 1 : 0,
        transition:"opacity 0.4s 0.8s ease",
      }}>
        v1.0.0
      </div>

      <style>{`
        @keyframes iconPulse {
          0%, 100% { box-shadow: 0 0 0 1px rgba(0,229,160,0.3), 0 8px 40px rgba(0,229,160,0.4), 0 0 80px rgba(0,229,160,0.2); }
          50% { box-shadow: 0 0 0 1px rgba(0,229,160,0.5), 0 8px 60px rgba(0,229,160,0.6), 0 0 120px rgba(0,229,160,0.3); }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}