import { useState } from "react";
import CyberPanel from "../components/CyberPanel";
import CyberButton from "../components/CyberButton";
import { ScoreBar, TagList, SectionLabel, VerdictBadge, FeatureError, Spinner } from "../components/FeatureResult";
import { useFeature } from "../hooks/useFeature";
import * as F from "../services/features";

const inp = { width:"100%", background:"var(--surface2)", border:"1px solid var(--border2)", color:"var(--text)", padding:"9px 12px", outline:"none", fontSize:"0.82rem", transition:"all 150ms" };
const lbl = { display:"block", fontSize:"0.58rem", color:"var(--text3)", letterSpacing:"0.15em", marginBottom:5 };
const onF = e => e.target.style.borderColor="var(--cyan)";
const onB = e => e.target.style.borderColor="var(--border2)";
const ta  = { ...inp, resize:"vertical" };

const TABS = [
  { id:"emi",          label:"EMI TRAP",         icon:"💳" },
  { id:"subscription", label:"SUBSCRIPTION",     icon:"📡" },
  { id:"secondhand",   label:"2ND HAND",         icon:"♻️" },
  { id:"auction",      label:"AUCTION ADVISOR",  icon:"🔨" },
  { id:"arbitrage",    label:"REGIONAL ARBITRAGE",icon:"🌍" },
];

// ── EMI Trap ──────────────────────────────────────────────
function EMITrapTool() {
  const [form, setForm] = useState({ productPrice:"", emiAmount:"", tenureMonths:"", processingFee:"0", claimedInterest:"0", currency:"INR" });
  const { result, loading, error, run } = useFeature(F.emiTrap);
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
      <CyberPanel>
        <SectionLabel>EMI OFFER DETAILS</SectionLabel>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div><label style={lbl}>{">"} PRODUCT PRICE *</label><input style={inp} onFocus={onF} onBlur={onB} type="number" value={form.productPrice} onChange={set("productPrice")} placeholder="50000" /></div>
            <div><label style={lbl}>{">"} CURRENCY</label>
              <select style={{ ...inp, cursor:"crosshair" }} onFocus={onF} onBlur={onB} value={form.currency} onChange={set("currency")}>
                {["INR","USD","EUR","GBP"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label style={lbl}>{">"} EMI AMOUNT/MONTH *</label><input style={inp} onFocus={onF} onBlur={onB} type="number" value={form.emiAmount} onChange={set("emiAmount")} placeholder="4500" /></div>
            <div><label style={lbl}>{">"} TENURE (MONTHS) *</label><input style={inp} onFocus={onF} onBlur={onB} type="number" value={form.tenureMonths} onChange={set("tenureMonths")} placeholder="12" /></div>
            <div><label style={lbl}>{">"} PROCESSING FEE</label><input style={inp} onFocus={onF} onBlur={onB} type="number" value={form.processingFee} onChange={set("processingFee")} placeholder="0" /></div>
            <div><label style={lbl}>{">"} CLAIMED INTEREST %</label><input style={inp} onFocus={onF} onBlur={onB} type="number" value={form.claimedInterest} onChange={set("claimedInterest")} placeholder="0 for '0% EMI'" /></div>
          </div>
          <div style={{ background:"rgba(255,229,0,0.06)", border:"1px solid rgba(255,229,0,0.2)", padding:"10px 12px", fontSize:"0.65rem", color:"var(--yellow)" }}>
            💡 Enter 0 for claimed interest rate if seller says "0% EMI" — we'll find the hidden cost
          </div>
          <CyberButton variant="solid" disabled={loading||!form.productPrice||!form.emiAmount||!form.tenureMonths}
            onClick={()=>run({ productPrice:parseFloat(form.productPrice), emiAmount:parseFloat(form.emiAmount), tenureMonths:parseInt(form.tenureMonths), processingFee:parseFloat(form.processingFee)||0, claimedInterest:parseFloat(form.claimedInterest)||0, currency:form.currency })}>
            {loading?"CALCULATING...":"> EXPOSE HIDDEN COSTS"}
          </CyberButton>
        </div>
      </CyberPanel>
      <div>
        {loading && <Spinner />}
        {error && <FeatureError error={error} />}
        {result && (
          <CyberPanel accent={result.isTrap?"magenta":"green"}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
              <SectionLabel>EMI ANALYSIS</SectionLabel>
              <VerdictBadge verdict={result.verdict} />
            </div>
            <ScoreBar label="TRAP SCORE" value={result.trapScore} color={result.trapScore>60?"var(--red)":"var(--green)"} />
            <div style={{ marginTop:14, display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {[
                { label:"TOTAL YOU PAY",      val:`${form.currency} ${result.totalAmountPaid?.toLocaleString()}`,   color:"var(--text)" },
                { label:"HIDDEN COST",         val:`${form.currency} ${result.hiddenCost?.toLocaleString()}`,        color: result.isTrap?"var(--red)":"var(--green)" },
                { label:"CLAIMED RATE",        val:`${result.claimedInterestRate}%`,                                color:"var(--yellow)" },
                { label:"ACTUAL RATE",         val:`${result.actualInterestRate}%`,                                 color: result.isTrap?"var(--red)":"var(--green)" },
              ].map(x=>(
                <div key={x.label} style={{ background:"var(--surface2)", padding:"10px 12px" }}>
                  <div style={{ fontSize:"0.52rem", color:"var(--text3)", letterSpacing:"0.1em", marginBottom:3 }}>{x.label}</div>
                  <div style={{ fontFamily:"var(--font-head)", fontSize:"1rem", color:x.color }}>{x.val}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:14 }}><SectionLabel>BETTER OPTIONS</SectionLabel><TagList items={result.betterOptions} color="var(--cyan)" /></div>
            <div style={{ marginTop:10, fontSize:"0.72rem", color:"var(--cyan)", borderTop:"1px solid var(--border)", paddingTop:10 }}>{result.recommendation}</div>
          </CyberPanel>
        )}
      </div>
    </div>
  );
}

// ── Subscription Analyzer ─────────────────────────────────
function SubscriptionTool() {
  const [form, setForm] = useState({ serviceName:"", planName:"", monthlyPrice:"", currency:"INR", features:"" });
  const { result, loading, error, run } = useFeature(F.subscriptionAnalyze);
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
      <CyberPanel>
        <SectionLabel>SUBSCRIPTION DETAILS</SectionLabel>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div><label style={lbl}>{">"} SERVICE NAME *</label><input style={inp} onFocus={onF} onBlur={onB} value={form.serviceName} onChange={set("serviceName")} placeholder="Netflix, Spotify, Adobe..." /></div>
            <div><label style={lbl}>{">"} PLAN NAME *</label><input style={inp} onFocus={onF} onBlur={onB} value={form.planName} onChange={set("planName")} placeholder="Premium, Family, Pro..." /></div>
            <div><label style={lbl}>{">"} MONTHLY PRICE *</label><input style={inp} onFocus={onF} onBlur={onB} type="number" value={form.monthlyPrice} onChange={set("monthlyPrice")} placeholder="649" /></div>
            <div><label style={lbl}>{">"} CURRENCY</label>
              <select style={{ ...inp, cursor:"crosshair" }} onFocus={onF} onBlur={onB} value={form.currency} onChange={set("currency")}>
                {["INR","USD","EUR","GBP"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div><label style={lbl}>{">"} FEATURES INCLUDED</label>
            <textarea style={{ ...ta, height:100 }} onFocus={onF} onBlur={onB} value={form.features} onChange={set("features")}
              placeholder="List what's included...\n4K streaming, 4 screens, offline download, no ads, etc." />
          </div>
          <CyberButton variant="solid" disabled={loading||!form.serviceName||!form.monthlyPrice}
            onClick={()=>run({ serviceName:form.serviceName, planName:form.planName, monthlyPrice:parseFloat(form.monthlyPrice), currency:form.currency, features:form.features })}>
            {loading?"ANALYZING...":"> ANALYZE VALUE"}
          </CyberButton>
        </div>
      </CyberPanel>
      <div>
        {loading && <Spinner />}
        {error && <FeatureError error={error} />}
        {result && (
          <CyberPanel>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
              <SectionLabel>SUBSCRIPTION ANALYSIS</SectionLabel>
              <VerdictBadge verdict={result.verdict} />
            </div>
            <ScoreBar label="VALUE SCORE" value={result.valueScore} />
            <div style={{ marginTop:14 }}>
              <SectionLabel>COMPETITOR COMPARISON</SectionLabel>
              {result.competitorComparison?.slice(0,4).map((c,i)=>(
                <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid var(--border)", fontSize:"0.72rem" }}>
                  <span style={{ color:"var(--text2)" }}>{c.service}</span>
                  <span style={{ color: c.betterValue?"var(--green)":"var(--text3)" }}>{c.price} {c.betterValue?"✓ CHEAPER":""}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop:14 }}><SectionLabel>HIDDEN COSTS</SectionLabel><TagList items={result.hiddenCosts} color="var(--yellow)" /></div>
            <div style={{ marginTop:10 }}><SectionLabel>CANCELLATION TIPS</SectionLabel><TagList items={result.cancellationTips} color="var(--cyan)" /></div>
            <div style={{ marginTop:12, fontSize:"0.72rem", color:"var(--cyan)", borderTop:"1px solid var(--border)", paddingTop:10 }}>{result.recommendation}</div>
          </CyberPanel>
        )}
      </div>
    </div>
  );
}

// ── Second-hand Validator ─────────────────────────────────
function SecondhandTool() {
  const [form, setForm] = useState({ productName:"", category:"", listedPrice:"", currency:"INR", condition:"Good", ageYears:"1", description:"", platform:"OLX" });
  const { result, loading, error, run } = useFeature(F.secondhandValidate);
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
      <CyberPanel>
        <SectionLabel>SECOND-HAND LISTING</SectionLabel>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div><label style={lbl}>{">"} PRODUCT NAME *</label><input style={inp} onFocus={onF} onBlur={onB} value={form.productName} onChange={set("productName")} placeholder="iPhone 13, Honda City, Washing Machine..." /></div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div><label style={lbl}>{">"} CATEGORY</label><input style={inp} onFocus={onF} onBlur={onB} value={form.category} onChange={set("category")} placeholder="Smartphones" /></div>
            <div><label style={lbl}>{">"} PLATFORM</label>
              <select style={{ ...inp, cursor:"crosshair" }} onFocus={onF} onBlur={onB} value={form.platform} onChange={set("platform")}>
                {["OLX","Facebook Marketplace","Quikr","CarDekho","Cars24","eBay","Other"].map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
            <div><label style={lbl}>{">"} LISTED PRICE *</label><input style={inp} onFocus={onF} onBlur={onB} type="number" value={form.listedPrice} onChange={set("listedPrice")} placeholder="25000" /></div>
            <div><label style={lbl}>{">"} CURRENCY</label>
              <select style={{ ...inp, cursor:"crosshair" }} onFocus={onF} onBlur={onB} value={form.currency} onChange={set("currency")}>
                {["INR","USD","EUR","GBP"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label style={lbl}>{">"} CONDITION</label>
              <select style={{ ...inp, cursor:"crosshair" }} onFocus={onF} onBlur={onB} value={form.condition} onChange={set("condition")}>
                {["Like New","Excellent","Good","Fair","Poor"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label style={lbl}>{">"} AGE (YEARS)</label><input style={inp} onFocus={onF} onBlur={onB} type="number" step="0.5" value={form.ageYears} onChange={set("ageYears")} placeholder="2" /></div>
          </div>
          <div><label style={lbl}>{">"} SELLER DESCRIPTION</label>
            <textarea style={{ ...ta, height:70 }} onFocus={onF} onBlur={onB} value={form.description} onChange={set("description")} placeholder="Paste seller's description here..." />
          </div>
          <CyberButton variant="solid" disabled={loading||!form.listedPrice}
            onClick={()=>run({ productName:form.productName, category:form.category, listedPrice:parseFloat(form.listedPrice), currency:form.currency, condition:form.condition, ageYears:parseFloat(form.ageYears)||1, description:form.description, platform:form.platform })}>
            {loading?"VALIDATING...":"> VALIDATE PRICE"}
          </CyberButton>
        </div>
      </CyberPanel>
      <div>
        {loading && <Spinner />}
        {error && <FeatureError error={error} />}
        {result && (
          <CyberPanel accent={result.verdict==="GREAT_DEAL"?"green":result.verdict==="SCAM_RISK"?"magenta":"cyan"}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
              <SectionLabel>2ND HAND VALIDATION</SectionLabel>
              <VerdictBadge verdict={result.verdict} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:14 }}>
              {[
                { label:"FAIR PRICE",   val:`${form.currency} ${result.fairSecondhandPrice?.toLocaleString()}`, color:"var(--cyan)" },
                { label:"RANGE MIN",    val:`${form.currency} ${result.priceRange?.min?.toLocaleString()}`,     color:"var(--green)" },
                { label:"RANGE MAX",    val:`${form.currency} ${result.priceRange?.max?.toLocaleString()}`,     color:"var(--text2)" },
              ].map(x=>(
                <div key={x.label} style={{ background:"var(--surface2)", padding:"8px 10px" }}>
                  <div style={{ fontSize:"0.5rem", color:"var(--text3)", letterSpacing:"0.1em", marginBottom:2 }}>{x.label}</div>
                  <div style={{ fontFamily:"var(--font-head)", fontSize:"0.9rem", color:x.color }}>{x.val}</div>
                </div>
              ))}
            </div>
            <ScoreBar label="SCAM RISK SCORE" value={result.scamRiskScore} color={result.scamRiskScore>60?"var(--red)":"var(--green)"} />
            <div style={{ marginTop:14 }}><SectionLabel>RED FLAGS</SectionLabel><TagList items={result.redFlags} color="var(--red)" /></div>
            <div style={{ marginTop:10 }}><SectionLabel>INSPECTION CHECKLIST</SectionLabel><TagList items={result.inspectionChecklist} color="var(--cyan)" /></div>
            {result.negotiationRoom>0 && <div style={{ marginTop:10, fontSize:"0.72rem", color:"var(--green)" }}>💰 Negotiation room: ~{form.currency} {result.negotiationRoom?.toLocaleString()}</div>}
            <div style={{ marginTop:10, fontSize:"0.72rem", color:"var(--cyan)", borderTop:"1px solid var(--border)", paddingTop:10 }}>{result.recommendation}</div>
          </CyberPanel>
        )}
      </div>
    </div>
  );
}

// ── Auction Advisor ───────────────────────────────────────
function AuctionTool() {
  const [form, setForm] = useState({ productName:"", category:"", currentBid:"", currency:"INR", timeRemaining:"2 hours", condition:"Used", numBidders:"3" });
  const { result, loading, error, run } = useFeature(F.auctionAdvisor);
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));
  const STRAT_COLOR = { BID_NOW:"var(--green)", WAIT:"var(--yellow)", SNIPE:"var(--cyan)", AVOID:"var(--red)" };

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
      <CyberPanel>
        <SectionLabel>AUCTION DETAILS</SectionLabel>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div><label style={lbl}>{">"} PRODUCT NAME *</label><input style={inp} onFocus={onF} onBlur={onB} value={form.productName} onChange={set("productName")} placeholder="Vintage Watch, MacBook, Car..." /></div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div><label style={lbl}>{">"} CATEGORY</label><input style={inp} onFocus={onF} onBlur={onB} value={form.category} onChange={set("category")} placeholder="Electronics" /></div>
            <div><label style={lbl}>{">"} CURRENT BID *</label><input style={inp} onFocus={onF} onBlur={onB} type="number" value={form.currentBid} onChange={set("currentBid")} placeholder="5000" /></div>
            <div><label style={lbl}>{">"} CURRENCY</label>
              <select style={{ ...inp, cursor:"crosshair" }} onFocus={onF} onBlur={onB} value={form.currency} onChange={set("currency")}>
                {["INR","USD","EUR","GBP"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label style={lbl}>{">"} TIME REMAINING</label>
              <select style={{ ...inp, cursor:"crosshair" }} onFocus={onF} onBlur={onB} value={form.timeRemaining} onChange={set("timeRemaining")}>
                {["5 minutes","30 minutes","1 hour","2 hours","6 hours","1 day","3 days"].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label style={lbl}>{">"} CONDITION</label>
              <select style={{ ...inp, cursor:"crosshair" }} onFocus={onF} onBlur={onB} value={form.condition} onChange={set("condition")}>
                {["New","Like New","Good","Fair","Poor"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label style={lbl}>{">"} ACTIVE BIDDERS</label><input style={inp} onFocus={onF} onBlur={onB} type="number" value={form.numBidders} onChange={set("numBidders")} placeholder="3" /></div>
          </div>
          <CyberButton variant="solid" disabled={loading||!form.currentBid}
            onClick={()=>run({ productName:form.productName, category:form.category, currentBid:parseFloat(form.currentBid), currency:form.currency, timeRemaining:form.timeRemaining, condition:form.condition, numBidders:parseInt(form.numBidders)||1 })}>
            {loading?"ANALYZING...":"> GET BID STRATEGY"}
          </CyberButton>
        </div>
      </CyberPanel>
      <div>
        {loading && <Spinner />}
        {error && <FeatureError error={error} />}
        {result && (
          <CyberPanel>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
              <SectionLabel>AUCTION STRATEGY</SectionLabel>
              <span style={{ border:`1px solid ${STRAT_COLOR[result.bidStrategy]||"var(--cyan)"}`, color:STRAT_COLOR[result.bidStrategy]||"var(--cyan)", padding:"3px 12px", fontSize:"0.7rem", fontFamily:"var(--font-head)", letterSpacing:"0.08em" }}>
                {result.bidStrategy}
              </span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:14 }}>
              {[
                { label:"MARKET VALUE",    val:`${form.currency} ${result.marketValue?.toLocaleString()}`,        color:"var(--text)" },
                { label:"MAX BID",         val:`${form.currency} ${result.recommendedMaxBid?.toLocaleString()}`,  color:"var(--cyan)" },
                { label:"EST. FINAL PRICE",val:`${form.currency} ${result.estimatedFinalPrice?.toLocaleString()}`,color:"var(--yellow)" },
              ].map(x=>(
                <div key={x.label} style={{ background:"var(--surface2)", padding:"8px 10px" }}>
                  <div style={{ fontSize:"0.5rem", color:"var(--text3)", letterSpacing:"0.1em", marginBottom:2 }}>{x.label}</div>
                  <div style={{ fontFamily:"var(--font-head)", fontSize:"0.9rem", color:x.color }}>{x.val}</div>
                </div>
              ))}
            </div>
            <ScoreBar label={`WIN PROBABILITY AT MAX BID`} value={result.winProbabilityAtMaxBid} />
            <div style={{ marginTop:14, fontSize:"0.72rem", color:"var(--text2)", lineHeight:1.7 }}>{result.auctionDynamics}</div>
            {result.sniperWindow && <div style={{ marginTop:8, fontSize:"0.68rem", color:"var(--cyan)" }}>⏱ SNIPER WINDOW: {result.sniperWindow}</div>}
            <div style={{ marginTop:12 }}><SectionLabel>BIDDING TIPS</SectionLabel><TagList items={result.bidingTips} color="var(--cyan)" /></div>
            <div style={{ marginTop:10 }}><SectionLabel>RED FLAGS</SectionLabel><TagList items={result.redFlags} color="var(--red)" /></div>
            <div style={{ marginTop:10, fontSize:"0.72rem", color:"var(--text2)", borderTop:"1px solid var(--border)", paddingTop:10 }}>{result.verdict}</div>
          </CyberPanel>
        )}
      </div>
    </div>
  );
}

// ── Regional Arbitrage ────────────────────────────────────
function ArbitrageTool() {
  const [form, setForm] = useState({ productName:"", category:"", localPrice:"", localCurrency:"INR" });
  const { result, loading, error, run } = useFeature(F.regionalArbitrage);
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
      <CyberPanel>
        <SectionLabel>PRODUCT + LOCAL PRICE</SectionLabel>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div><label style={lbl}>{">"} PRODUCT NAME *</label><input style={inp} onFocus={onF} onBlur={onB} value={form.productName} onChange={set("productName")} placeholder="iPhone 15 Pro, PS5, Nike Air Max..." /></div>
          <div><label style={lbl}>{">"} CATEGORY</label><input style={inp} onFocus={onF} onBlur={onB} value={form.category} onChange={set("category")} placeholder="Smartphones" /></div>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:10 }}>
            <div><label style={lbl}>{">"} YOUR LOCAL PRICE *</label><input style={inp} onFocus={onF} onBlur={onB} type="number" value={form.localPrice} onChange={set("localPrice")} placeholder="135000" /></div>
            <div><label style={lbl}>{">"} CURRENCY</label>
              <select style={{ ...inp, cursor:"crosshair" }} onFocus={onF} onBlur={onB} value={form.localCurrency} onChange={set("localCurrency")}>
                {["INR","USD","EUR","GBP","AED","SGD"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <CyberButton variant="solid" disabled={loading||!form.localPrice}
            onClick={()=>run({ productName:form.productName, category:form.category, localPrice:parseFloat(form.localPrice), localCurrency:form.localCurrency })}>
            {loading?"SCANNING REGIONS...":"> COMPARE GLOBALLY"}
          </CyberButton>
        </div>
      </CyberPanel>
      <div>
        {loading && <Spinner />}
        {error && <FeatureError error={error} />}
        {result && (
          <CyberPanel>
            <SectionLabel>REGIONAL PRICE COMPARISON</SectionLabel>
            {result.cheapestRegion && (
              <div style={{ marginBottom:14, background:"rgba(0,255,136,0.06)", border:"1px solid rgba(0,255,136,0.2)", padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:"0.68rem", color:"var(--text3)" }}>CHEAPEST REGION</span>
                <span style={{ fontFamily:"var(--font-head)", color:"var(--green)", fontSize:"1rem" }}>{result.cheapestRegion}</span>
              </div>
            )}
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {result.regionalPrices?.map((r,i)=>{
                const isLocal = r.currency === form.localCurrency;
                const isCheap = r.country === result.cheapestRegion;
                return (
                  <div key={i} style={{
                    display:"grid", gridTemplateColumns:"1.5fr 1fr 1fr 1fr", gap:8,
                    background: isCheap?"rgba(0,255,136,0.05)":isLocal?"rgba(0,229,255,0.03)":"transparent",
                    border: isCheap?"1px solid rgba(0,255,136,0.2)":"1px solid var(--border)",
                    padding:"8px 12px", fontSize:"0.68rem",
                  }}>
                    <span style={{ color: isCheap?"var(--green)":isLocal?"var(--cyan)":"var(--text2)", fontWeight:isCheap?700:400 }}>
                      {r.country} {isLocal?"(YOU)":""}{isCheap?" ★":""}
                    </span>
                    <span style={{ color:"var(--text3)" }}>{r.currency} {r.estimatedPrice?.toLocaleString()}</span>
                    <span style={{ color:"var(--text3)", fontSize:"0.6rem" }}>Duty: {r.importDuty}%</span>
                    <span style={{ color: isCheap?"var(--green)":"var(--text3)" }}>{form.localCurrency} {r.totalLandedCost?.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
            {result.potentialSavings>0 && (
              <div style={{ marginTop:14, background:"rgba(0,255,136,0.06)", border:"1px solid rgba(0,255,136,0.2)", padding:"10px 14px", fontSize:"0.72rem" }}>
                💰 Potential savings: <span style={{ color:"var(--green)", fontFamily:"var(--font-head)" }}>{form.localCurrency} {result.potentialSavings?.toLocaleString()}</span>
                <span style={{ color:"var(--text3)", marginLeft:8 }}>{result.arbitrageViable?"(VIABLE)":"(may not be worth it after duties)"}</span>
              </div>
            )}
            <div style={{ marginTop:12 }}><SectionLabel>IMPORT CONSIDERATIONS</SectionLabel><TagList items={result.importConsiderations} color="var(--yellow)" /></div>
            <div style={{ marginTop:10, fontSize:"0.72rem", color:"var(--cyan)", borderTop:"1px solid var(--border)", paddingTop:10 }}>{result.recommendation}</div>
          </CyberPanel>
        )}
      </div>
    </div>
  );
}

export default function NicheToolsPage() {
  const [tab, setTab] = useState("emi");
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div className="animate-fade-up">
        <div style={{ fontSize:"0.58rem", color:"var(--text3)", letterSpacing:"0.2em", marginBottom:4 }}>MODULE_09</div>
        <h1 style={{ fontSize:"1.5rem", color:"var(--cyan)", textShadow:"var(--glow-cyan)" }}>NICHE <span style={{ color:"var(--text)" }}>INTELLIGENCE</span></h1>
        <div style={{ width:36, height:2, background:"var(--cyan)", marginTop:8, boxShadow:"var(--glow-cyan)" }} />
      </div>
      <div style={{ display:"flex", gap:2, borderBottom:"1px solid var(--border)", flexWrap:"wrap" }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            padding:"10px 16px", fontSize:"0.6rem", letterSpacing:"0.1em",
            background:"transparent", cursor:"crosshair",
            color:tab===t.id?"var(--cyan)":"var(--text3)",
            borderBottom:tab===t.id?"2px solid var(--cyan)":"2px solid transparent",
            transition:"all 150ms",
          }}>{t.icon} {t.label}</button>
        ))}
      </div>
      <div className="animate-fade-up">
        {tab==="emi"          && <EMITrapTool />}
        {tab==="subscription" && <SubscriptionTool />}
        {tab==="secondhand"   && <SecondhandTool />}
        {tab==="auction"      && <AuctionTool />}
        {tab==="arbitrage"    && <ArbitrageTool />}
      </div>
    </div>
  );
}
