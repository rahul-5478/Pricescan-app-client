import { useState } from "react";
import CyberPanel from "../components/CyberPanel";
import CyberButton from "../components/CyberButton";
import { ScoreBar, TagList, SectionLabel, VerdictBadge, FeatureError, Spinner } from "../components/FeatureResult";
import { useFeature } from "../hooks/useFeature";
import * as F from "../services/features";

const inp = { width:"100%", background:"var(--surface2)", border:"1px solid var(--border2)", color:"var(--text)", padding:"9px 12px", outline:"none", fontSize:"0.82rem", transition:"all 150ms" };
const ta  = { ...inp, resize:"vertical" };
const lbl = { display:"block", fontSize:"0.58rem", color:"var(--text3)", letterSpacing:"0.15em", marginBottom:5 };
const onF = e => { e.target.style.borderColor="var(--cyan)"; };
const onB = e => { e.target.style.borderColor="var(--border2)"; };

const TABS = [
  { id:"psychology", label:"SELLER PSYCHOLOGY", icon:"🧠" },
  { id:"discount",   label:"FAKE DISCOUNT",     icon:"🎭" },
  { id:"reviews",    label:"REVIEW SENTIMENT",  icon:"⭐" },
  { id:"bundle",     label:"BUNDLE TRAP",       icon:"📦" },
];

// ── Seller Psychology ─────────────────────────────────────
function SellerPsychologyTool() {
  const [text, setText] = useState("");
  const { result, loading, error, run } = useFeature(F.sellerPsychology);

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
      <CyberPanel>
        <SectionLabel>PASTE PRODUCT LISTING TEXT</SectionLabel>
        <textarea style={{ ...ta, height:200, marginBottom:14 }} onFocus={onF} onBlur={onB}
          value={text} onChange={e=>setText(e.target.value)}
          placeholder={`Paste product listing here...\n\nExample:\n"⚡ FLASH SALE! Only 3 left in stock! HURRY!\nLimited time offer - was ₹9999 now ₹2999!\nCustomers are viewing this item right now..."`}
        />
        <CyberButton variant="solid" disabled={loading||!text.trim()} onClick={() => run({ listingText: text })}>
          {loading ? "ANALYZING..." : "> DETECT MANIPULATION"}
        </CyberButton>
      </CyberPanel>

      <div>
        {loading && <Spinner />}
        {error && <FeatureError error={error} />}
        {result && (
          <CyberPanel accent={result.safetyRating === "SAFE" ? "green" : "magenta"}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <SectionLabel>MANIPULATION SCAN RESULT</SectionLabel>
              <VerdictBadge verdict={result.safetyRating} />
            </div>
            <ScoreBar label="MANIPULATION SCORE" value={result.manipulationScore} />
            <div style={{ marginTop:16 }}>
              <SectionLabel>DETECTED TACTICS ({result.tactics?.length || 0})</SectionLabel>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {result.tactics?.map((t,i) => (
                  <div key={i} style={{
                    background:"var(--surface2)", borderLeft:`2px solid ${t.severity==="HIGH"?"var(--red)":t.severity==="MEDIUM"?"var(--yellow)":"var(--text3)"}`,
                    padding:"10px 14px",
                  }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ fontSize:"0.72rem", fontWeight:600, color:"var(--text)" }}>{t.name}</span>
                      <span style={{ fontSize:"0.6rem", color: t.severity==="HIGH"?"var(--red)":t.severity==="MEDIUM"?"var(--yellow)":"var(--text3)" }}>{t.severity}</span>
                    </div>
                    <div style={{ fontSize:"0.65rem", color:"var(--cyan)", fontStyle:"italic", marginBottom:4 }}>"{t.quote}"</div>
                    <div style={{ fontSize:"0.65rem", color:"var(--text3)" }}>{t.explanation}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop:14, fontSize:"0.72rem", color:"var(--text2)", borderTop:"1px solid var(--border)", paddingTop:12 }}>
              {result.recommendation}
            </div>
          </CyberPanel>
        )}
      </div>
    </div>
  );
}

// ── Fake Discount ─────────────────────────────────────────
function FakeDiscountTool() {
  const [form, setForm] = useState({ productName:"", originalPrice:"", salePrice:"", context:"" });
  const { result, loading, error, run } = useFeature(F.fakeDiscount);
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
      <CyberPanel>
        <SectionLabel>DISCOUNT CLAIM DETAILS</SectionLabel>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div><label style={lbl}>{">"} PRODUCT NAME</label><input style={inp} onFocus={onF} onBlur={onB} value={form.productName} onChange={set("productName")} placeholder="iPhone 15 Pro" /></div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div><label style={lbl}>{">"} ORIGINAL PRICE *</label><input style={inp} onFocus={onF} onBlur={onB} type="number" value={form.originalPrice} onChange={set("originalPrice")} placeholder="9999" /></div>
            <div><label style={lbl}>{">"} SALE PRICE *</label><input style={inp} onFocus={onF} onBlur={onB} type="number" value={form.salePrice} onChange={set("salePrice")} placeholder="4999" /></div>
          </div>
          <div><label style={lbl}>{">"} CONTEXT (OPTIONAL)</label><textarea style={{ ...ta, height:80 }} onFocus={onF} onBlur={onB} value={form.context} onChange={set("context")} placeholder="Festival sale, seller claims 50% off..." /></div>
          <CyberButton variant="solid" disabled={loading||!form.originalPrice||!form.salePrice}
            onClick={()=>run({ productName:form.productName, originalPrice:parseFloat(form.originalPrice), salePrice:parseFloat(form.salePrice), context:form.context })}>
            {loading ? "VERIFYING..." : "> VERIFY DISCOUNT"}
          </CyberButton>
        </div>
      </CyberPanel>
      <div>
        {loading && <Spinner />}
        {error && <FeatureError error={error} />}
        {result && (
          <CyberPanel accent={result.isGenuine ? "green" : "magenta"}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <SectionLabel>DISCOUNT VERIFICATION</SectionLabel>
              <VerdictBadge verdict={result.verdict} />
            </div>
            <ScoreBar label="CONFIDENCE" value={result.confidenceScore} />
            <div style={{ marginTop:16, display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {[
                { label:"CLAIMED DISCOUNT", val:`${result.claimedDiscountPercent}%`, color:"var(--yellow)" },
                { label:"ACTUAL DISCOUNT",  val:`${result.actualDiscountPercent}%`,  color: result.isGenuine?"var(--green)":"var(--red)" },
                { label:"EST. MARKET PRICE", val:`₹${result.estimatedOriginalMarketPrice?.toLocaleString()}`, color:"var(--cyan)" },
              ].map(item=>(
                <div key={item.label} style={{ background:"var(--surface2)", padding:"10px 12px" }}>
                  <div style={{ fontSize:"0.55rem", color:"var(--text3)", letterSpacing:"0.12em", marginBottom:4 }}>{item.label}</div>
                  <div style={{ fontFamily:"var(--font-head)", fontSize:"1.1rem", color:item.color }}>{item.val}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:14 }}><SectionLabel>RED FLAGS</SectionLabel><TagList items={result.redFlags} color="var(--red)" /></div>
            <div style={{ marginTop:12, fontSize:"0.72rem", color:"var(--text2)" }}>{result.explanation}</div>
            <div style={{ marginTop:10, fontSize:"0.72rem", color:"var(--cyan)", borderTop:"1px solid var(--border)", paddingTop:10 }}>{result.recommendation}</div>
          </CyberPanel>
        )}
      </div>
    </div>
  );
}

// ── Review Sentiment ──────────────────────────────────────
function ReviewSentimentTool() {
  const [form, setForm] = useState({ productName:"", price:"", currency:"INR", reviews:"" });
  const { result, loading, error, run } = useFeature(F.reviewSentiment);
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
      <CyberPanel>
        <SectionLabel>PRODUCT + REVIEWS</SectionLabel>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:10 }}>
            <div><label style={lbl}>{">"} PRODUCT NAME</label><input style={inp} onFocus={onF} onBlur={onB} value={form.productName} onChange={set("productName")} placeholder="Boat Rockerz 450" /></div>
            <div><label style={lbl}>{">"} PRICE</label><input style={inp} onFocus={onF} onBlur={onB} type="number" value={form.price} onChange={set("price")} placeholder="1999" /></div>
            <div><label style={lbl}>{">"} CURRENCY</label>
              <select style={{ ...inp, cursor:"crosshair" }} onFocus={onF} onBlur={onB} value={form.currency} onChange={set("currency")}>
                {["INR","USD","EUR","GBP"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div><label style={lbl}>{">"} PASTE REVIEWS *</label>
            <textarea style={{ ...ta, height:180 }} onFocus={onF} onBlur={onB} value={form.reviews} onChange={set("reviews")} placeholder={"Paste multiple reviews here...\n\n\"Battery life is terrible, not worth the price\"\n\"Sound quality is average for this price range\"\n\"Broke after 2 months, very disappointing\""} />
          </div>
          <CyberButton variant="solid" disabled={loading||!form.reviews.trim()}
            onClick={()=>run({ productName:form.productName, price:parseFloat(form.price)||0, currency:form.currency, reviews:form.reviews })}>
            {loading ? "ANALYZING..." : "> ANALYZE SENTIMENT"}
          </CyberButton>
        </div>
      </CyberPanel>
      <div>
        {loading && <Spinner />}
        {error && <FeatureError error={error} />}
        {result && (
          <CyberPanel accent={result.priceJustified?"green":"magenta"}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <SectionLabel>SENTIMENT ANALYSIS</SectionLabel>
              <VerdictBadge verdict={result.pricingVerdict} />
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <ScoreBar label="SENTIMENT SCORE"     value={result.sentimentScore} />
              <ScoreBar label="QUALITY SCORE"       value={result.qualityScore} />
              <ScoreBar label="VALUE FOR MONEY"     value={result.valueForMoneyScore} />
            </div>
            <div style={{ marginTop:14, display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div><SectionLabel>👍 PRAISES</SectionLabel><TagList items={result.commonPraises} color="var(--green)" /></div>
              <div><SectionLabel>👎 COMPLAINTS</SectionLabel><TagList items={result.commonComplaints} color="var(--red)" /></div>
            </div>
            <div style={{ marginTop:12, fontSize:"0.72rem", color:"var(--text2)", lineHeight:1.7 }}>{result.summary}</div>
            <div style={{ marginTop:10, color:"var(--cyan)", fontSize:"0.72rem", borderTop:"1px solid var(--border)", paddingTop:10 }}>{result.recommendation}</div>
          </CyberPanel>
        )}
      </div>
    </div>
  );
}

// ── Bundle Trap ───────────────────────────────────────────
function BundleTrapTool() {
  const [form, setForm] = useState({ bundleDescription:"", bundlePrice:"", currency:"INR" });
  const { result, loading, error, run } = useFeature(F.bundleTrap);
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
      <CyberPanel>
        <SectionLabel>BUNDLE DEAL DETAILS</SectionLabel>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div><label style={lbl}>{">"} BUNDLE DESCRIPTION *</label>
            <textarea style={{ ...ta, height:140 }} onFocus={onF} onBlur={onB} value={form.bundleDescription} onChange={set("bundleDescription")}
              placeholder={"Describe what's in the bundle...\n\nExample:\nBuy 2 Get 1 Free - Dove soap 3 pack\nCombo: Shampoo 400ml + Conditioner 200ml + Face wash 100ml\nFamily pack: Rice 5kg + Dal 1kg + Oil 1L"} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:10 }}>
            <div><label style={lbl}>{">"} BUNDLE PRICE *</label><input style={inp} onFocus={onF} onBlur={onB} type="number" value={form.bundlePrice} onChange={set("bundlePrice")} placeholder="499" /></div>
            <div><label style={lbl}>{">"} CURRENCY</label>
              <select style={{ ...inp, cursor:"crosshair" }} onFocus={onF} onBlur={onB} value={form.currency} onChange={set("currency")}>
                {["INR","USD","EUR","GBP"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <CyberButton variant="solid" disabled={loading||!form.bundleDescription||!form.bundlePrice}
            onClick={()=>run({ bundleDescription:form.bundleDescription, bundlePrice:parseFloat(form.bundlePrice), currency:form.currency })}>
            {loading ? "ANALYZING..." : "> DETECT TRAP"}
          </CyberButton>
        </div>
      </CyberPanel>
      <div>
        {loading && <Spinner />}
        {error && <FeatureError error={error} />}
        {result && (
          <CyberPanel accent={result.isTrap?"magenta":"green"}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <SectionLabel>BUNDLE ANALYSIS</SectionLabel>
              <VerdictBadge verdict={result.verdict} />
            </div>
            <ScoreBar label="TRAP SCORE" value={result.trapScore} color={result.trapScore>60?"var(--red)":"var(--green)"} />
            <div style={{ marginTop:14, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
              {[
                { label:"INDIVIDUAL TOTAL", val:`${result.estimatedIndividualTotal}` },
                { label:"ACTUAL SAVINGS",   val:`${result.actualSavings}` },
                { label:"SAVINGS %",        val:`${result.actualSavingsPercent}%` },
              ].map(x=>(
                <div key={x.label} style={{ background:"var(--surface2)", padding:"8px 10px" }}>
                  <div style={{ fontSize:"0.52rem", color:"var(--text3)", letterSpacing:"0.1em", marginBottom:3 }}>{x.label}</div>
                  <div style={{ fontFamily:"var(--font-head)", fontSize:"1rem", color: result.isTrap?"var(--red)":"var(--green)" }}>{x.val}</div>
                </div>
              ))}
            </div>
            {result.breakdown?.length>0 && (
              <div style={{ marginTop:14 }}>
                <SectionLabel>ITEM BREAKDOWN</SectionLabel>
                {result.breakdown.map((b,i)=>(
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:"0.68rem", padding:"4px 0", borderBottom:"1px solid var(--border)" }}>
                    <span style={{ color:"var(--text2)" }}>{b.item}</span>
                    <span style={{ color:"var(--cyan)" }}>≈ {b.estimatedPrice}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop:12, color:"var(--cyan)", fontSize:"0.72rem" }}>{result.recommendation}</div>
            {result.betterAlternative && <div style={{ marginTop:6, fontSize:"0.68rem", color:"var(--text3)" }}>💡 {result.betterAlternative}</div>}
          </CyberPanel>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function AIToolsPage() {
  const [tab, setTab] = useState("psychology");

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div className="animate-fade-up">
        <div style={{ fontSize:"0.58rem", color:"var(--text3)", letterSpacing:"0.2em", marginBottom:4 }}>MODULE_06</div>
        <h1 style={{ fontSize:"1.5rem", color:"var(--cyan)", textShadow:"var(--glow-cyan)" }}>AI <span style={{ color:"var(--text)" }}>INTELLIGENCE TOOLS</span></h1>
        <div style={{ width:36, height:2, background:"var(--cyan)", marginTop:8, boxShadow:"var(--glow-cyan)" }} />
      </div>

      <div style={{ display:"flex", gap:2, borderBottom:"1px solid var(--border)", flexWrap:"wrap" }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            padding:"10px 18px", fontSize:"0.62rem", letterSpacing:"0.1em",
            background:"transparent", cursor:"crosshair",
            color: tab===t.id?"var(--cyan)":"var(--text3)",
            borderBottom: tab===t.id?"2px solid var(--cyan)":"2px solid transparent",
            transition:"all 150ms",
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      <div className="animate-fade-up">
        {tab==="psychology" && <SellerPsychologyTool />}
        {tab==="discount"   && <FakeDiscountTool />}
        {tab==="reviews"    && <ReviewSentimentTool />}
        {tab==="bundle"     && <BundleTrapTool />}
      </div>
    </div>
  );
}
