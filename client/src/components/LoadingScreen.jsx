export default function LoadingScreen() {
  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg, #f0f4ff, #faf5ff)",
      gap:20,
    }}>
      <div style={{
        width:72, height:72, borderRadius:20,
        background:"linear-gradient(135deg, #6366f1, #8b5cf6)",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:32, boxShadow:"0 8px 32px rgba(99,102,241,0.35)",
        animation:"pulse 1.5s ease infinite",
      }}>⚡</div>
      <div>
        <h2 style={{ fontFamily:"var(--font-head)", fontSize:"1.3rem", fontWeight:800, textAlign:"center", color:"var(--text)" }}>
          Price<span style={{ color:"var(--primary)" }}>Scan</span>
        </h2>
        <p style={{ textAlign:"center", fontSize:"0.82rem", color:"var(--text3)", marginTop:4 }}>
          AI Price Intelligence
        </p>
      </div>
      <div style={{ display:"flex", gap:6 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width:8, height:8, borderRadius:"50%",
            background:"var(--primary)", opacity:0.3,
            animation:`blink 1.2s ${i*0.2}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}
