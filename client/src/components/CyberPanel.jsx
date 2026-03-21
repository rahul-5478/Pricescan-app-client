/* Reusable cyberpunk panel with corner brackets and optional glow */
export default function CyberPanel({ children, style = {}, glow = false, accent = "cyan", className = "" }) {
  const color = accent === "magenta" ? "var(--magenta)" : accent === "green" ? "var(--green)" : "var(--cyan)";
  return (
    <div className={`bracket-box ${className}`} style={{
      background: "var(--surface)",
      border: `1px solid var(--border)`,
      borderLeft: `2px solid ${color}`,
      padding: "20px 24px",
      position: "relative",
      boxShadow: glow ? `inset 0 0 30px rgba(0,229,255,0.03), 0 0 0 1px var(--border)` : "none",
      ...style,
    }}>
      {children}
    </div>
  );
}
