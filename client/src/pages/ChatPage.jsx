
import { useState, useRef, useEffect } from "react";
import api from "../services/api";

const SUGGESTIONS = [
  "Should I buy Sony headphones?",
  "Is iPhone 16 fairly priced?",
  "Best phone under ₹15,000?",
  "What to buy in the sale?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState([{
    role:"assistant",
    text:"Hi! 👋 I'm your AI shopping advisor. Ask me anything — whether to buy a product, when it'll get cheaper, or where to find it for less!",
    time: new Date(),
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();
  const textareaRef = useRef();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, loading]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    setMessages(m => [...m, { role:"user", text:msg, time:new Date() }]);
    setLoading(true);
    try {
      const history = messages.map(m => ({ role:m.role==="assistant"?"assistant":"user", content:m.text }));
      const { data } = await api.post("/advanced/chat", { message:msg, history });
      const r = data.result || data;
      setMessages(m => [...m, {
        role:"assistant",
        text: r.reply || "I didn't quite get that. Please try again.",
        tips: r.tips || [],
        verdict: r.verdict,
        time: new Date(),
      }]);
    } catch {
      setMessages(m => [...m, { role:"assistant", text:"Sorry, something went wrong. Please try again in a moment. 🙏", time:new Date() }]);
    } finally { setLoading(false); }
  };

  const fmt = d => d?.toLocaleTimeString?.("en-IN", { hour:"2-digit", minute:"2-digit" }) || "";

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"calc(100dvh - var(--header-h) - var(--nav-h) - var(--safe-b))" }}>

      {/* Messages */}
      <div style={{ flex:1, overflowY:"auto", padding:"16px", display:"flex", flexDirection:"column", gap:14 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:msg.role==="user"?"flex-end":"flex-start", animation:`fadeUp 0.3s ${i*0.04}s both` }}>
            {msg.role === "assistant" && (
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:"linear-gradient(135deg,var(--c-emerald),#00A878)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, boxShadow:"0 4px 12px rgba(0,229,160,0.3)" }}>✦</div>
                <span style={{ fontFamily:"var(--f-display)", fontSize:"0.65rem", color:"var(--c-text3)", fontWeight:600 }}>AI Assistant</span>
              </div>
            )}

            <div style={{
              maxWidth:"85%", padding:"12px 16px",
              borderRadius: msg.role==="user" ? "20px 20px 4px 20px" : "4px 20px 20px 20px",
              background: msg.role==="user"
                ? "linear-gradient(135deg,var(--c-violet) 0%,#5A52EE 100%)"
                : "var(--c-surface2)",
              color: msg.role==="user" ? "#fff" : "var(--c-text)",
              fontSize:"0.87rem", lineHeight:1.7,
              border: msg.role==="user" ? "none" : "1px solid var(--c-border)",
              boxShadow: msg.role==="user" ? "0 4px 20px rgba(124,111,255,0.35)" : "var(--shadow-card)",
            }}>{msg.text}</div>

            {msg.verdict && msg.verdict !== "null" && (
              <div style={{
                marginTop:8, padding:"6px 14px", borderRadius:99, display:"inline-flex", alignItems:"center", gap:6,
                background: msg.verdict==="BUY" ? "rgba(0,229,160,0.1)" : msg.verdict==="AVOID" ? "rgba(255,95,95,0.1)" : "rgba(255,181,71,0.1)",
                border:`1px solid ${msg.verdict==="BUY"?"rgba(0,229,160,0.2)":msg.verdict==="AVOID"?"rgba(255,95,95,0.2)":"rgba(255,181,71,0.2)"}`,
                color: msg.verdict==="BUY" ? "var(--c-emerald)" : msg.verdict==="AVOID" ? "var(--c-over)" : "var(--c-amber)",
              }}>
                <span style={{ fontSize:12 }}>{msg.verdict==="BUY"?"✓":msg.verdict==="AVOID"?"✗":"⏳"}</span>
                <span style={{ fontFamily:"var(--f-display)", fontSize:"0.68rem", fontWeight:700, letterSpacing:"0.08em" }}>
                  {msg.verdict==="BUY" ? "BUY IT" : msg.verdict==="AVOID" ? "AVOID IT" : "WAIT"}
                </span>
              </div>
            )}

            {msg.tips?.length > 0 && (
              <div style={{ maxWidth:"85%", display:"flex", flexDirection:"column", gap:6, marginTop:6 }}>
                {msg.tips.map((t, j) => (
                  <div key={j} style={{ padding:"8px 12px", borderRadius:12, background:"rgba(0,229,160,0.06)", border:"1px solid rgba(0,229,160,0.15)", fontSize:"0.73rem", color:"var(--c-emerald)", fontWeight:500, lineHeight:1.5 }}>
                    💡 {t}
                  </div>
                ))}
              </div>
            )}
            <span style={{ fontSize:"0.58rem", color:"var(--c-text3)", marginTop:4, paddingLeft:2 }}>{fmt(msg.time)}</span>
          </div>
        ))}

        {loading && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-start" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <div style={{ width:28, height:28, borderRadius:8, background:"linear-gradient(135deg,var(--c-emerald),#00A878)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>✦</div>
              <span style={{ fontFamily:"var(--f-display)", fontSize:"0.65rem", color:"var(--c-text3)", fontWeight:600 }}>AI is thinking...</span>
            </div>
            <div style={{ padding:"14px 18px", borderRadius:"4px 20px 20px 20px", background:"var(--c-surface2)", border:"1px solid var(--c-border)", display:"flex", gap:5, alignItems:"center" }}>
              {[0,1,2].map(i => <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:"var(--c-emerald)", opacity:0.5, animation:`pulse 1.4s ${i*0.2}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div style={{ padding:"8px 16px", display:"flex", gap:8, overflowX:"auto", scrollbarWidth:"none" }}>
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => send(s)} style={{ padding:"8px 14px", borderRadius:99, border:"1px solid var(--c-border)", background:"var(--c-surface2)", color:"var(--c-text2)", fontFamily:"var(--f-display)", fontSize:"0.72rem", fontWeight:500, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }}>{s}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding:"12px 16px", background:"rgba(7,8,15,0.8)", backdropFilter:"blur(16px)", borderTop:"1px solid var(--c-border)", display:"flex", gap:10, alignItems:"flex-end" }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask me anything about a product..."
          rows={1}
          style={{ flex:1, padding:"12px 14px", background:"var(--c-surface2)", border:"1.5px solid var(--c-border)", borderRadius:16, fontFamily:"var(--f-body)", fontSize:"0.9rem", color:"var(--c-text)", outline:"none", resize:"none", maxHeight:100, lineHeight:1.5, transition:"border-color 0.2s" }}
          onFocus={e => e.target.style.borderColor="var(--c-emerald)"}
          onBlur={e => e.target.style.borderColor="var(--c-border)"}
        />
        <button onClick={() => send()} disabled={!input.trim() || loading} style={{
          width:46, height:46, borderRadius:14, border:"none", flexShrink:0,
          background: input.trim() && !loading ? "linear-gradient(135deg,var(--c-emerald),#00A878)" : "var(--c-surface2)",
          color: input.trim() && !loading ? "var(--c-bg)" : "var(--c-text3)",
          fontSize:18, cursor:input.trim()?"pointer":"not-allowed",
          display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s",
          boxShadow: input.trim() && !loading ? "0 4px 16px rgba(0,229,160,0.35)" : "none",
        }}>✦</button>
      </div>
    </div>
  );
}