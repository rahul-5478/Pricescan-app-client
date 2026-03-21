import { useState } from "react";
import CyberPanel from "../components/CyberPanel";
import CyberButton from "../components/CyberButton";
import { ScoreBar, TagList, SectionLabel, VerdictBadge, FeatureError, Spinner } from "../components/FeatureResult";
import { useFeature } from "../hooks/useFeature";
import * as F from "../services/features";

const inp = { width:"100%", background:"var(--surface2)", border:"1px solid var(--border2)", color:"var(--text)", padding:"9px 12px", outline:"none", fontSize:"0.82rem", transition:"all 150ms" };
const ta  = { ...inp, resize:"vertical" };
const lbl = { display:"block", fontSize:"0.58rem", color:"var(--text3)", letterSpacing:"0.15em", marginBottom:5 };
const onF = e => e.target.style.borderColor="var(--cyan)";
const onB = e => e.target.style.borderColor="var(--border2)";

const TABS = [
  { id:"negotiate", label:"NEGOTIATION SCRIPT", icon:"🤝" },
  { id:"shame",     label:"SELLER TRUST SCORE", icon:"🏴" },
  { id:"community", label:"COMMUNITY PRICES",   icon:"👥" },
];

// ── Negotiation Script ────────────────────────────────────
function NegotiationTool() {
  const [form, setForm] = useState({ productName:"", listedPrice:"", fairPrice:"", currency:"INR", marketplace:"", context:"" });
  const { result, loading, error, run } = useFeature(F.negotiationScript);
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));
  const PHASE_COLOR = { OPENING:"var(--cyan)", COUNTER:"var(--yellow)", CLOSING:"var(--green)", WALKAWAY:"var(--red)" };

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
      <CyberPanel>
        <SectionLabel>DEAL PARAMETERS</SectionLabel>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div><label style={lbl}>{">"} PRODUCT NAME *</label><input style={inp} onFocus={onF} onBlur={onB} value={form.productName} onChange={set("productName")} placeholder="Laptop, Car, Property..." /></div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
            <div><label style={lbl}>{">"} LISTED PRICE *</label><input style={inp} onFocus={onF} onBlur={onB} type="number" value={form.listedPrice} onChange={set("listedPrice")} placeholder="50000" /></div>
            <div><label style={lbl}>{">"} FAIR PRICE *</label><input style={inp} onFocus={onF} onBlur={onB} type="number" value={form.fairPrice} onChange={set("fairPrice")} placeholder="40000" /></div>
            <div><label style={lbl}>{">"} CURRENCY</label>
              <select style={{ ...inp, cursor:"crosshair" }} onFocus={onF} onBlur={onB} value={form.currency} onChange={set("currency")}>
                {["INR","USD","EUR","GBP"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div><label style={lbl}>{">"} MARKETPLACE/SELLER</label><input style={inp} onFocus={onF} onBlur={onB} value={form.marketplace} onChange={set("marketplace")} placeholder="Amazon, Local shop, OLX seller..." /></div>
          <div><label style={lbl}>{">"} ADDITIONAL CONTEXT</label><textarea style={{ ...ta, height:80 }} onFocus={onF} onBlur={onB} value={form.context} onChange={set("context")} placeholder="Any extra info: seller urgency, competition, your leverage..." /></div>
          <CyberButton variant="solid" disabled={loading||!form.listedPrice||!form.fairPrice}
            onClick={()=>run({ productName:form.productName, listedPrice:parseFloat(form.listedPrice), fairPrice:parseFloat(form.fairPrice), currency:form.currency, marketplace:form.marketplace, context:form.context })}>
            {loading ? "GENERATING..." : "> GENERATE SCRIPT"}
          </CyberButton>
        </div>
      </CyberPanel>
      <div>
        {loading && <Spinner />}
        {error && <FeatureError error={error} />}
        {result && (
          <CyberPanel accent="green">
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
              <SectionLabel>NEGOTIATION STRATEGY</SectionLabel>
              <span style={{ fontSize:"0.65rem", color:"var(--green)" }}>WIN PROB: {result.successProbability}%</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:14 }}>
              {[
                { label:"OPENING OFFER", val:`${form.currency} ${result.openingOffer?.toLocaleString()}`, color:"var(--cyan)" },
                { label:"TARGET PRICE",  val:`${form.currency} ${result.targetPrice?.toLocaleString()}`,  color:"var(--green)" },
                { label:"WALK AWAY",     val:`${form.currency} ${result.walkAwayPrice?.toLocaleString()}`,color:"var(--red)" },
              ].map(x=>(
                <div key={x.label} style={{ background:"var(--surface2)", padding:"8px 10px", textAlign:"center" }}>
                  <div style={{ fontSize:"0.5rem", color:"var(--text3)", letterSpacing:"0.1em", marginBottom:3 }}>{x.label}</div>
                  <div style={{ fontFamily:"var(--font-head)", fontSize:"0.9rem", color:x.color }}>{x.val}</div>
                </div>
              ))}
            </div>
            <SectionLabel>SCRIPTS BY PHASE</SectionLabel>
            <div style={{ display:"flex", flexDirection:"column", gap:10, maxHeight:260, overflowY:"auto" }}>
              {result.scripts?.map((s,i)=>(
                <div key={i} style={{ background:"var(--surface2)", borderLeft:`2px solid ${PHASE_COLOR[s.phase]||"var(--text3)"}`, padding:"10px 14px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontSize:"0.6rem", color:PHASE_COLOR[s.phase]||"var(--text3)", letterSpacing:"0.12em" }}>{s.phase}</span>
                  </div>
                  <div style={{ fontSize:"0.72rem", color:"var(--text)", lineHeight:1.6, fontStyle:"italic" }}>"{s.message}"</div>
                  {s.notes && <div style={{ fontSize:"0.62rem", color:"var(--text3)", marginTop:4 }}>💡 {s.notes}</div>}
                </div>
              ))}
            </div>
            <div style={{ marginTop:12 }}><SectionLabel>POWER MOVES</SectionLabel><TagList items={result.powerMoves} color="var(--cyan)" /></div>
            <div style={{ marginTop:10 }}><SectionLabel>AVOID</SectionLabel><TagList items={result.thingsToAvoid} color="var(--red)" /></div>
          </CyberPanel>
        )}
      </div>
    </div>
  );
}

// ── Price Shame Score ─────────────────────────────────────
function PriceShameTool() {
  const [form, setForm] = useState({ sellerName:"", productName:"", listedPrice:"", category:"", marketplace:"" });
  const { result, loading, error, run } = useFeature(F.priceShame);
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
      <CyberPanel>
        <SectionLabel>SELLER DETAILS</SectionLabel>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {[
            { key:"sellerName",  label:"SELLER NAME",    placeholder:"TechBazaar, Seller123, Amazon Seller..." },
            { key:"productName", label:"PRODUCT",        placeholder:"Samsung Galaxy S24..." },
            { key:"marketplace", label:"MARKETPLACE",    placeholder:"Amazon, Flipkart, OLX..." },
          ].map(f=>(
            <div key={f.key}><label style={lbl}>{">"} {f.label}</label>
              <input style={inp} onFocus={onF} onBlur={onB} value={form[f.key]} onChange={set(f.key)} placeholder={f.placeholder} />
            </div>
          ))}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div><label style={lbl}>{">"} LISTED PRICE *</label><input style={inp} onFocus={onF} onBlur={onB} type="number" value={form.listedPrice} onChange={set("listedPrice")} placeholder="15999" /></div>
            <div><label style={lbl}>{">"} CATEGORY</label><input style={inp} onFocus={onF} onBlur={onB} value={form.category} onChange={set("category")} placeholder="Smartphones" /></div>
          </div>
          <CyberButton variant="solid" disabled={loading||!form.listedPrice}
            onClick={()=>run({ sellerName:form.sellerName, productName:form.productName, listedPrice:parseFloat(form.listedPrice), category:form.category, marketplace:form.marketplace })}>
            {loading ? "SCORING..." : "> RATE SELLER"}
          </CyberButton>
        </div>
      </CyberPanel>
      <div>
        {loading && <Spinner />}
        {error && <FeatureError error={error} />}
        {result && (
          <CyberPanel accent={result.trustRating==="TRUSTED"?"green":result.trustRating==="PREDATORY"?"magenta":"cyan"}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
              <SectionLabel>SELLER TRUST ANALYSIS</SectionLabel>
              <VerdictBadge verdict={result.trustRating} />
            </div>
            <ScoreBar label="SHAME SCORE (higher = worse)" value={result.shameScore} color={result.shameScore>60?"var(--red)":result.shameScore>30?"var(--yellow)":"var(--green)"} />
            <div style={{ marginTop:14 }}>
              <SectionLabel>PRICING PATTERNS</SectionLabel>
              {result.pricingPatterns?.map((p,i)=>(
                <div key={i} style={{ borderLeft:`2px solid ${p.severity==="HIGH"?"var(--red)":"var(--yellow)"}`, padding:"8px 12px", marginBottom:8, background:"var(--surface2)" }}>
                  <div style={{ fontSize:"0.7rem", fontWeight:600, color:"var(--text)", marginBottom:2 }}>{p.pattern}</div>
                  <div style={{ fontSize:"0.65rem", color:"var(--text3)" }}>{p.description}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:12 }}><SectionLabel>⚠ WARNING FLAGS</SectionLabel><TagList items={result.warningFlags} color="var(--red)" /></div>
            <div style={{ marginTop:10 }}><SectionLabel>✓ POSITIVE SIGNS</SectionLabel><TagList items={result.positiveIndicators} color="var(--green)" /></div>
            <div style={{ marginTop:12, display:"flex", justifyContent:"space-between", alignItems:"center", borderTop:"1px solid var(--border)", paddingTop:12 }}>
              <span style={{ fontSize:"0.65rem", color:"var(--text3)" }}>{result.overallAssessment}</span>
              <VerdictBadge verdict={result.recommendation} />
            </div>
          </CyberPanel>
        )}
      </div>
    </div>
  );
}

// ── Community Prices ──────────────────────────────────────
function CommunityPricesTool() {
  const [query, setQuery] = useState("");
  const { result, loading, error, run } = useFeature((data) => F.communityPrices(data.name));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <CyberPanel>
        <SectionLabel>SEARCH COMMUNITY REPORTS</SectionLabel>
        <p style={{ fontSize:"0.68rem", color:"var(--text3)", marginBottom:14, lineHeight:1.7 }}>
          Crowdsourced price data from all PriceScan users. Search any product to see what others paid.
        </p>
        <div style={{ display:"flex", gap:10 }}>
          <input style={{ ...inp, flex:1 }} onFocus={onF} onBlur={onB}
            value={query} onChange={e=>setQuery(e.target.value)}
            placeholder="Search product name (e.g. 'iPhone 15', 'Sony TV')..."
            onKeyDown={e=>e.key==="Enter"&&query.trim()&&run({ name:query })}
          />
          <CyberButton variant="solid" disabled={loading||!query.trim()} onClick={()=>run({ name:query })}>
            {loading?"SEARCHING...":"> SEARCH"}
          </CyberButton>
        </div>
      </CyberPanel>

      {loading && <Spinner />}
      {error && <FeatureError error={error} />}
      {result && (
        <CyberPanel className="animate-fade-up">
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:10 }}>
            <SectionLabel>COMMUNITY DATA — {result.stats?.count || 0} REPORTS</SectionLabel>
            {result.stats?.count>0 && (
              <div style={{ display:"flex", gap:16 }}>
                {[
                  { label:"AVG PRICE", val: result.stats.avg ? `₹${Math.round(result.stats.avg).toLocaleString()}` : "—" },
                  { label:"MIN",       val: result.stats.min ? `₹${result.stats.min.toLocaleString()}` : "—" },
                  { label:"MAX",       val: result.stats.max ? `₹${result.stats.max.toLocaleString()}` : "—" },
                ].map(x=>(
                  <div key={x.label} style={{ textAlign:"center" }}>
                    <div style={{ fontSize:"0.52rem", color:"var(--text3)", letterSpacing:"0.1em" }}>{x.label}</div>
                    <div style={{ fontFamily:"var(--font-head)", fontSize:"0.9rem", color:"var(--cyan)" }}>{x.val}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {result.reports?.length===0 ? (
            <div style={{ textAlign:"center", padding:"30px 0", color:"var(--text3)", fontSize:"0.72rem" }}>No community reports yet for this product.</div>
          ) : (
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.72rem" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid var(--border)" }}>
                  {["PRODUCT","PRICE","VERDICT","DATE"].map(h=>(
                    <th key={h} style={{ padding:"8px 12px", textAlign:"left", fontSize:"0.55rem", color:"var(--text3)", letterSpacing:"0.12em", fontWeight:400 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.reports.map((r,i)=>{
                  const vc = { OVERPRICED:"var(--red)", FAIR:"var(--green)", UNDERPRICED:"var(--cyan)" };
                  const color = vc[r["result.verdict"]] || vc[r.result?.verdict] || "var(--text3)";
                  return (
                    <tr key={i} style={{ borderBottom:"1px solid var(--border)" }}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(0,229,255,0.02)"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={{ padding:"8px 12px", maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.productName}</td>
                      <td style={{ padding:"8px 12px" }}>{r.currency} {r.listedPrice?.toLocaleString()}</td>
                      <td style={{ padding:"8px 12px", color }}>{r.result?.verdict || "—"}</td>
                      <td style={{ padding:"8px 12px", color:"var(--text3)", fontSize:"0.62rem" }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CyberPanel>
      )}
    </div>
  );
}

export default function SocialToolsPage() {
  const [tab, setTab] = useState("negotiate");
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div className="animate-fade-up">
        <div style={{ fontSize:"0.58rem", color:"var(--text3)", letterSpacing:"0.2em", marginBottom:4 }}>MODULE_08</div>
        <h1 style={{ fontSize:"1.5rem", color:"var(--cyan)", textShadow:"var(--glow-cyan)" }}>SOCIAL <span style={{ color:"var(--text)" }}>TOOLS</span></h1>
        <div style={{ width:36, height:2, background:"var(--cyan)", marginTop:8, boxShadow:"var(--glow-cyan)" }} />
      </div>
      <div style={{ display:"flex", gap:2, borderBottom:"1px solid var(--border)" }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            padding:"10px 18px", fontSize:"0.62rem", letterSpacing:"0.1em",
            background:"transparent", cursor:"crosshair",
            color:tab===t.id?"var(--cyan)":"var(--text3)",
            borderBottom:tab===t.id?"2px solid var(--cyan)":"2px solid transparent",
            transition:"all 150ms",
          }}>{t.icon} {t.label}</button>
        ))}
      </div>
      <div className="animate-fade-up">
        {tab==="negotiate" && <NegotiationTool />}
        {tab==="shame"     && <PriceShameTool />}
        {tab==="community" && <CommunityPricesTool />}
      </div>
    </div>
  );
}
