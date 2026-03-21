/* ── Shared clean UI components ─────────────────────────── */

export function Card({ children, style={}, className="" }) {
  return (
    <div className={`card ${className}`} style={{ padding:"16px", ...style }}>
      {children}
    </div>
  );
}

export function Btn({ children, onClick, disabled, variant="primary", size="md", type="button", style={}, full=false }) {
  const variants = {
    primary:  { bg:"var(--primary)",   color:"white",         border:"transparent",   hover:"var(--primary-dark)" },
    outline:  { bg:"transparent",      color:"var(--primary)", border:"var(--primary)", hover:"var(--primary-bg)" },
    ghost:    { bg:"transparent",      color:"var(--text2)",   border:"var(--border)",  hover:"var(--bg2)" },
    danger:   { bg:"var(--danger)",    color:"white",          border:"transparent",   hover:"#dc2626" },
    success:  { bg:"var(--success)",   color:"white",          border:"transparent",   hover:"#059669" },
    warning:  { bg:"var(--warning)",   color:"white",          border:"transparent",   hover:"var(--accent-dark)" },
  };
  const v = variants[variant] || variants.primary;
  const pad = size==="sm" ? "7px 14px" : size==="lg" ? "14px 28px" : "10px 20px";
  const fs  = size==="sm" ? "0.8rem" : size==="lg" ? "1rem" : "0.875rem";

  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      padding:pad, fontSize:fs, fontWeight:600,
      background: disabled ? "var(--bg2)" : v.bg,
      color: disabled ? "var(--text3)" : v.color,
      border:`1px solid ${disabled ? "var(--border)" : v.border}`,
      borderRadius:"var(--radius)",
      width: full ? "100%" : undefined,
      transition:"all 150ms", opacity: disabled ? 0.7 : 1,
      display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8,
      boxShadow: !disabled && variant==="primary" ? "0 2px 8px rgba(99,102,241,0.3)" : "none",
      ...style,
    }}
    onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = v.hover; }}
    onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = v.bg; }}
    onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = "scale(0.97)"; }}
    onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
    onTouchStart={e => { if (!disabled) e.currentTarget.style.transform = "scale(0.97)"; }}
    onTouchEnd={e => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {children}
    </button>
  );
}

export function Input({ label, value, onChange, placeholder, type="text", required, maxLength, rows, hint, error, style={} }) {
  const baseStyle = {
    width:"100%", padding:"11px 14px",
    background:"var(--surface)", border:`1px solid ${error ? "var(--danger)" : "var(--border)"}`,
    borderRadius:"var(--radius)", fontSize:"0.9rem", color:"var(--text)",
    outline:"none", transition:"all 150ms", ...style,
  };
  return (
    <div>
      {label && (
        <label style={{ display:"block", fontSize:"0.8rem", fontWeight:600, color:"var(--text2)", marginBottom:6 }}>
          {label}{required && <span style={{ color:"var(--danger)", marginLeft:2 }}>*</span>}
        </label>
      )}
      {rows ? (
        <textarea value={value} onChange={onChange} placeholder={placeholder}
          maxLength={maxLength} rows={rows} required={required}
          style={{ ...baseStyle, resize:"vertical" }}
          onFocus={e => { e.target.style.borderColor="var(--primary)"; e.target.style.boxShadow="0 0 0 3px rgba(99,102,241,0.1)"; }}
          onBlur={e => { e.target.style.borderColor=error?"var(--danger)":"var(--border)"; e.target.style.boxShadow="none"; }}
        />
      ) : (
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          maxLength={maxLength} required={required}
          style={baseStyle}
          onFocus={e => { e.target.style.borderColor="var(--primary)"; e.target.style.boxShadow="0 0 0 3px rgba(99,102,241,0.1)"; }}
          onBlur={e => { e.target.style.borderColor=error?"var(--danger)":"var(--border)"; e.target.style.boxShadow="none"; }}
        />
      )}
      {hint && !error && <p style={{ fontSize:"0.75rem", color:"var(--text3)", marginTop:4 }}>{hint}</p>}
      {error && <p style={{ fontSize:"0.75rem", color:"var(--danger)", marginTop:4 }}>⚠ {error}</p>}
    </div>
  );
}

export function Select({ label, value, onChange, options, required }) {
  return (
    <div>
      {label && <label style={{ display:"block", fontSize:"0.8rem", fontWeight:600, color:"var(--text2)", marginBottom:6 }}>{label}{required&&<span style={{ color:"var(--danger)", marginLeft:2 }}>*</span>}</label>}
      <select value={value} onChange={onChange} required={required} style={{
        width:"100%", padding:"11px 14px",
        background:"var(--surface)", border:"1px solid var(--border)",
        borderRadius:"var(--radius)", fontSize:"0.9rem", color:"var(--text)",
        outline:"none", transition:"all 150ms", appearance:"none",
        backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center",
      }}
      onFocus={e => { e.target.style.borderColor="var(--primary)"; e.target.style.boxShadow="0 0 0 3px rgba(99,102,241,0.1)"; }}
      onBlur={e => { e.target.style.borderColor="var(--border)"; e.target.style.boxShadow="none"; }}
      >
        {options.map(o => typeof o === "string"
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>
        )}
      </select>
    </div>
  );
}

export function Badge({ children, color="primary" }) {
  const colors = {
    primary:  { bg:"var(--primary-bg)",  text:"var(--primary)" },
    success:  { bg:"var(--success-bg)",  text:"var(--success)" },
    danger:   { bg:"var(--danger-bg)",   text:"var(--danger)" },
    warning:  { bg:"var(--warning-bg)",  text:"var(--warning)" },
    info:     { bg:"var(--info-bg)",     text:"var(--info)" },
    gray:     { bg:"var(--bg2)",         text:"var(--text2)" },
  };
  const c = colors[color] || colors.primary;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center",
      padding:"3px 10px", borderRadius:99,
      background:c.bg, color:c.text,
      fontSize:"0.72rem", fontWeight:600, letterSpacing:"0.01em",
    }}>{children}</span>
  );
}

export function Alert({ children, type="info" }) {
  const types = {
    info:    { bg:"var(--info-bg)",    border:"#bfdbfe", color:"var(--info)",    icon:"ℹ️" },
    success: { bg:"var(--success-bg)", border:"#a7f3d0", color:"var(--success)", icon:"✅" },
    warning: { bg:"var(--warning-bg)", border:"#fde68a", color:"var(--warning)", icon:"⚠️" },
    danger:  { bg:"var(--danger-bg)",  border:"#fecaca", color:"var(--danger)",  icon:"❌" },
  };
  const t = types[type] || types.info;
  return (
    <div style={{
      background:t.bg, border:`1px solid ${t.border}`,
      borderRadius:"var(--radius)", padding:"12px 14px",
      display:"flex", gap:10, alignItems:"flex-start",
      fontSize:"0.85rem", color:"var(--text2)", lineHeight:1.6,
    }}>
      <span style={{ flexShrink:0 }}>{t.icon}</span>
      <span>{children}</span>
    </div>
  );
}

export function Spinner({ size=24, color="var(--primary)" }) {
  return (
    <div style={{
      width:size, height:size,
      border:`2px solid var(--border)`,
      borderTopColor:color, borderRadius:"50%",
      animation:"spin 0.7s linear infinite", flexShrink:0,
    }} />
  );
}

export function LoadingCard() {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"48px 24px", gap:14 }}>
      <Spinner size={32} />
      <p style={{ fontSize:"0.85rem", color:"var(--text3)", fontWeight:500 }}>Claude AI analyze kar raha hai…</p>
    </div>
  );
}

export function ScoreRing({ value, size=72, label }) {
  const r = (size/2) - 6;
  const circ = 2 * Math.PI * r;
  const dash = (value/100) * circ;
  const color = value >= 70 ? "var(--success)" : value >= 40 ? "var(--warning)" : "var(--danger)";
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
      <div style={{ position:"relative", width:size, height:size }}>
        <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg2)" strokeWidth={5} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ transition:"stroke-dasharray 1s cubic-bezier(0.16,1,0.3,1)" }}
          />
        </svg>
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span style={{ fontSize:size>60?"1rem":"0.8rem", fontWeight:700, color, fontFamily:"var(--font-head)" }}>{value}%</span>
        </div>
      </div>
      {label && <span style={{ fontSize:"0.65rem", color:"var(--text3)", fontWeight:500 }}>{label}</span>}
    </div>
  );
}

export function SectionHeader({ title, subtitle, icon }) {
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        {icon && <span style={{ fontSize:22 }}>{icon}</span>}
        <div>
          <h2 style={{ fontSize:"1.2rem", fontWeight:700 }}>{title}</h2>
          {subtitle && <p style={{ fontSize:"0.8rem", color:"var(--text3)", marginTop:2 }}>{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ icon="📭", title, subtitle }) {
  return (
    <div style={{ textAlign:"center", padding:"40px 24px" }}>
      <div style={{ fontSize:48, marginBottom:12 }}>{icon}</div>
      <h3 style={{ fontSize:"1rem", fontWeight:600, marginBottom:6 }}>{title}</h3>
      {subtitle && <p style={{ fontSize:"0.85rem", color:"var(--text3)" }}>{subtitle}</p>}
    </div>
  );
}
