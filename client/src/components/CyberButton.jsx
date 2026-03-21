export default function CyberButton({ children, onClick, disabled, variant="primary", size="md", type="button", style={} }) {
  const variants = {
    primary:   { bg: "transparent", color: "var(--cyan)",    border: "var(--cyan)",    hoverBg: "rgba(0,229,255,0.08)",    glow: "var(--glow-cyan)" },
    danger:    { bg: "transparent", color: "var(--red)",     border: "var(--red)",     hoverBg: "rgba(255,59,92,0.08)",    glow: "none" },
    success:   { bg: "transparent", color: "var(--green)",   border: "var(--green)",   hoverBg: "rgba(0,255,136,0.08)",    glow: "none" },
    magenta:   { bg: "transparent", color: "var(--magenta)", border: "var(--magenta)", hoverBg: "rgba(255,45,120,0.08)",   glow: "var(--glow-mag)" },
    solid:     { bg: "var(--cyan)", color: "#000",           border: "var(--cyan)",    hoverBg: "var(--cyan)",             glow: "var(--glow-cyan)" },
  };
  const v = variants[variant] || variants.primary;
  const pad = size === "sm" ? "5px 12px" : size === "lg" ? "12px 28px" : "8px 18px";
  const fs  = size === "sm" ? "0.65rem" : size === "lg" ? "0.8rem" : "0.72rem";

  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      padding: pad, fontSize: fs, letterSpacing: "0.12em",
      background: v.bg, color: disabled ? "var(--text3)" : v.color,
      border: `1px solid ${disabled ? "var(--border2)" : v.border}`,
      position: "relative", overflow: "hidden",
      transition: "all 150ms",
      opacity: disabled ? 0.5 : 1,
      fontFamily: "var(--font-body)",
      ...style,
    }}
    onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = v.hoverBg; e.currentTarget.style.boxShadow = v.glow; }}}
    onMouseLeave={e => { e.currentTarget.style.background = v.bg; e.currentTarget.style.boxShadow = "none"; }}>
      {children}
    </button>
  );
}
