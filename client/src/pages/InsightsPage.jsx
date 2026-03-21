import { useState, useEffect } from "react";
import { Card, Btn, Input, SectionHeader, Spinner, EmptyState, Badge, Alert } from "../components/UI";
import { spendingReport, competitorPrices, priceDropPredict, fakeProductDetect, returnPolicyAnalyze, priceManipulation } from "../services/advanced";
import { getBlacklist, reportSeller, getBudget, saveBudget } from "../services/advanced";
import { useFeature } from "../hooks/useFeature";
import { ScoreBar, SectionLabel, VerdictBadge, FeatureError, Spinner as FSpinner } from "../components/FeatureResult";

const TABS = [
  { id:"report",      label:"Spending",    icon:"📊" },
  { id:"budget",      label:"Budget",      icon:"💰" },
  { id:"competitor",  label:"Find Cheaper",icon:"🔍" },
  { id:"fake",        label:"Fake Detect", icon:"🕵️" },
  { id:"returnpolicy",label:"Return Policy",icon:"📜" },
  { id:"blacklist",   label:"Blacklist",   icon:"🚫" },
];

const inp = { width:"100%", padding:"10px 12px", border:"1.5px solid var(--border)", borderRadius:8, fontSize:"0.875rem", outline:"none", color:"var(--text)", transition:"all 150ms", background:"var(--bg)" };
const lbl = { display:"block", fontSize:"0.8rem", fontWeight:600, color:"var(--text2)", marginBottom:6 };
const onF = e=>{e.target.style.borderColor="var(--primary)";e.target.style.boxShadow="0 0 0 3px rgba(99,102,241,0.12)";};
const onB = e=>{e.target.style.borderColor="var(--border)";e.target.style.boxShadow="none";};

function SpendingTab() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0,7));
  const { result, loading, error, run } = useFeature(spendingReport);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <Card>
        <label style={lbl}>Month select karo</label>
        <div style={{ display:"flex", gap:10 }}>
          <input type="month" value={month} onChange={e=>setMonth(e.target.value)} style={{ ...inp, flex:1 }} onFocus={onF} onBlur={onB} />
          <Btn onClick={()=>run({ month, currency:"INR" })} disabled={loading}>{loading?"Analyzing...":"Generate Report"}</Btn>
        </div>
      </Card>
      {loading && <div style={{ display:"flex", justifyContent:"center", padding:32 }}><Spinner size={32} /></div>}
      {error && <Alert type="danger">{error}</Alert>}
      {result && (
        <div style={{ display:"flex", flexDirection:"column", gap:12, animation:"fadeUp 0.4s ease both" }}>
          <Card style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)", border:"none", padding:"18px" }}>
            <div style={{ color:"rgba(255,255,255,0.8)", fontSize:"0.78rem", marginBottom:4 }}>Shopping Score</div>
            <div style={{ fontFamily:"var(--font-head)", fontSize:"2rem", fontWeight:800, color:"white" }}>{result.overallScore}/100</div>
            <div style={{ color:"rgba(255,255,255,0.9)", fontSize:"0.85rem", fontWeight:600 }}>{result.scoreLabel}</div>
          </Card>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
            {[
              { l:"Scanned",    v:result.totalScanned,                   c:"var(--primary)" },
              { l:"Overpriced", v:result.overpriced,                     c:"var(--danger)" },
              { l:"Saved ₹",    v:result.potentialSavings?.toLocaleString(), c:"var(--success)" },
            ].map(s=>(
              <Card key={s.l} style={{ padding:"12px", textAlign:"center" }}>
                <div style={{ fontFamily:"var(--font-head)", fontSize:"1.2rem", fontWeight:800, color:s.c }}>{s.v}</div>
                <div style={{ fontSize:"0.7rem", color:"var(--text3)", marginTop:2 }}>{s.l}</div>
              </Card>
            ))}
          </div>
          <Card>
            <p style={{ fontSize:"0.85rem", fontWeight:600, marginBottom:10 }}>💡 Insights</p>
            {result.insights?.map((ins,i)=>(
              <div key={i} style={{ fontSize:"0.8rem", color:"var(--text2)", padding:"6px 0", borderBottom:"1px solid var(--border)", lineHeight:1.5 }}>• {ins}</div>
            ))}
          </Card>
          <Card>
            <p style={{ fontSize:"0.85rem", fontWeight:600, marginBottom:10 }}>🎯 Recommendations</p>
            {result.recommendations?.map((r,i)=>(
              <div key={i} style={{ fontSize:"0.8rem", color:"var(--text2)", padding:"6px 0", borderBottom:"1px solid var(--border)", lineHeight:1.5 }}>→ {r}</div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}

function BudgetTab() {
  const [limit, setLimit] = useState("");
  const [saving, setSaving] = useState(false);
  const [data, setData]   = useState(null);
  const month = new Date().toISOString().slice(0,7);

  useEffect(() => {
    getBudget(month).then(({data:d})=>{ setData(d); setLimit(d.budget?.monthlyLimit||""); }).catch(()=>{});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveBudget({ monthlyLimit:parseFloat(limit), currency:"INR", month });
      const {data:d} = await getBudget(month);
      setData(d);
    } catch {}
    finally { setSaving(false); }
  };

  const pct = data && data.budget?.monthlyLimit ? Math.min(100, Math.round((data.spent/data.budget.monthlyLimit)*100)) : 0;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <Card>
        <p style={{ fontSize:"0.85rem", fontWeight:600, color:"var(--text2)", marginBottom:12 }}>Monthly Budget Set karo</p>
        <div style={{ display:"flex", gap:10 }}>
          <input type="number" value={limit} onChange={e=>setLimit(e.target.value)} placeholder="e.g. 50000" style={{ ...inp, flex:1 }} onFocus={onF} onBlur={onB} />
          <Btn onClick={handleSave} disabled={saving||!limit}>{saving?"Saving...":"Save"}</Btn>
        </div>
      </Card>
      {data && data.budget?.monthlyLimit>0 && (
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <p style={{ fontSize:"0.85rem", fontWeight:600 }}>This Month</p>
            <span style={{ fontSize:"0.8rem", color: pct>90?"var(--danger)":pct>70?"var(--warning)":"var(--success)", fontWeight:600 }}>{pct}% used</span>
          </div>
          <div style={{ background:"var(--bg2)", borderRadius:99, height:10, overflow:"hidden", marginBottom:12 }}>
            <div style={{
              height:"100%", borderRadius:99, transition:"width 1s ease",
              width:`${pct}%`,
              background: pct>90?"var(--danger)":pct>70?"var(--warning)":"var(--success)",
            }} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
            {[
              { l:"Spent",     v:`₹${data.spent?.toLocaleString()}`,                c:"var(--danger)" },
              { l:"Budget",    v:`₹${data.budget.monthlyLimit?.toLocaleString()}`,  c:"var(--primary)" },
              { l:"Remaining", v:`₹${Math.max(0,data.budget.monthlyLimit-data.spent)?.toLocaleString()}`, c:"var(--success)" },
            ].map(s=>(
              <div key={s.l} style={{ textAlign:"center", background:"var(--bg2)", borderRadius:10, padding:"10px 8px" }}>
                <div style={{ fontFamily:"var(--font-head)", fontSize:"1rem", fontWeight:800, color:s.c }}>{s.v}</div>
                <div style={{ fontSize:"0.7rem", color:"var(--text3)", marginTop:2 }}>{s.l}</div>
              </div>
            ))}
          </div>
          {pct>85 && <Alert type="warning" style={{ marginTop:12 }}>⚠️ Budget almost khatam! ₹{Math.max(0,data.budget.monthlyLimit-data.spent).toLocaleString()} bacha hai.</Alert>}
        </Card>
      )}
    </div>
  );
}

function CompetitorTab() {
  const [form, setForm] = useState({ productName:"", category:"", currentPrice:"", currency:"INR" });
  const { result, loading, error, run } = useFeature(competitorPrices);
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <Card>
        <p style={{ fontSize:"0.85rem", fontWeight:600, color:"var(--text2)", marginBottom:12 }}>Kahan sasta milega dhundho</p>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div><label style={lbl}>Product Name</label><input style={inp} onFocus={onF} onBlur={onB} value={form.productName} onChange={set("productName")} placeholder="Sony WH-1000XM5" /></div>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:10 }}>
            <div><label style={lbl}>Current Price</label><input type="number" style={inp} onFocus={onF} onBlur={onB} value={form.currentPrice} onChange={set("currentPrice")} placeholder="34990" /></div>
            <div><label style={lbl}>Currency</label>
              <select style={{ ...inp }} onFocus={onF} onBlur={onB} value={form.currency} onChange={set("currency")}>
                {["INR","USD","EUR"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <Btn full onClick={()=>run({ ...form, currentPrice:parseFloat(form.currentPrice) })} disabled={loading||!form.currentPrice}>
            {loading?"Searching...":"🔍 Find Cheaper Options"}
          </Btn>
        </div>
      </Card>
      {loading && <div style={{ display:"flex", justifyContent:"center", padding:32 }}><Spinner size={32} /></div>}
      {error && <Alert type="danger">{error}</Alert>}
      {result && (
        <div style={{ display:"flex", flexDirection:"column", gap:10, animation:"fadeUp 0.4s ease both" }}>
          <Alert type="success">Best deal: <strong>{result.bestDeal}</strong> — Max ₹{result.maxSavings?.toLocaleString()} savings!</Alert>
          {result.alternatives?.map((a,i)=>(
            <Card key={i} style={{ padding:"12px", borderLeft: i===0?"3px solid var(--success)":"1px solid var(--border)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                <span style={{ fontWeight:600, fontSize:"0.88rem" }}>{a.platform}</span>
                <span style={{ fontFamily:"var(--font-head)", fontSize:"1rem", fontWeight:800, color:a.savings>0?"var(--success)":"var(--text)" }}>
                  ₹{a.estimatedPrice?.toLocaleString()}
                </span>
              </div>
              {a.savings>0 && <div style={{ fontSize:"0.75rem", color:"var(--success)", marginBottom:4 }}>Save ₹{a.savings?.toLocaleString()} ({a.savingsPercent}%)</div>}
              <div style={{ fontSize:"0.72rem", color:"var(--text3)" }}>{a.notes}</div>
            </Card>
          ))}
          {result.cashbackTips?.length>0 && (
            <Card>
              <p style={{ fontSize:"0.8rem", fontWeight:600, marginBottom:8 }}>💳 Cashback Tips</p>
              {result.cashbackTips.map((t,i)=><div key={i} style={{ fontSize:"0.75rem", color:"var(--text2)", marginBottom:4 }}>• {t}</div>)}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function FakeDetectTab() {
  const [form, setForm] = useState({ productName:"", description:"", price:"", currency:"INR", sellerName:"" });
  const { result, loading, error, run } = useFeature(fakeProductDetect);
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <Card>
        <p style={{ fontSize:"0.85rem", fontWeight:600, color:"var(--text2)", marginBottom:12 }}>Fake product detect karo</p>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div><label style={lbl}>Product Name</label><input style={inp} onFocus={onF} onBlur={onB} value={form.productName} onChange={set("productName")} placeholder="Nike Air Max 270" /></div>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:10 }}>
            <div><label style={lbl}>Price</label><input type="number" style={inp} onFocus={onF} onBlur={onB} value={form.price} onChange={set("price")} placeholder="499" /></div>
            <div><label style={lbl}>Currency</label><select style={inp} onFocus={onF} onBlur={onB} value={form.currency} onChange={set("currency")}>{["INR","USD"].map(c=><option key={c}>{c}</option>)}</select></div>
          </div>
          <div><label style={lbl}>Seller Name</label><input style={inp} onFocus={onF} onBlur={onB} value={form.sellerName} onChange={set("sellerName")} placeholder="Seller ka naam" /></div>
          <div><label style={lbl}>Product Description</label><textarea rows={3} style={{ ...inp, resize:"vertical" }} onFocus={onF} onBlur={onB} value={form.description} onChange={set("description")} placeholder="Product listing copy paste karo..." /></div>
          <Btn full onClick={()=>run({ ...form, price:parseFloat(form.price) })} disabled={loading||!form.productName}>
            {loading?"Detecting...":"🕵️ Detect Fake"}
          </Btn>
        </div>
      </Card>
      {loading && <div style={{ display:"flex", justifyContent:"center", padding:32 }}><Spinner size={32} /></div>}
      {error && <Alert type="danger">{error}</Alert>}
      {result && (
        <Card style={{ animation:"fadeUp 0.4s ease both", borderTop:`3px solid ${result.isFakeRisk?"var(--danger)":"var(--success)"}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div>
              <div style={{ fontSize:"1.5rem" }}>{result.isFakeRisk?"🚨":"✅"}</div>
              <Badge color={result.isFakeRisk?"danger":"success"}>{result.verdict?.replace(/_/g," ")}</Badge>
            </div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"var(--font-head)", fontSize:"1.5rem", fontWeight:800, color:result.fakeScore>60?"var(--danger)":"var(--success)" }}>{result.fakeScore}%</div>
              <div style={{ fontSize:"0.7rem", color:"var(--text3)" }}>Fake Risk</div>
            </div>
          </div>
          <div style={{ marginBottom:10 }}>
            <p style={{ fontSize:"0.75rem", fontWeight:600, color:"var(--danger)", marginBottom:6 }}>⚠ Red Flags</p>
            {result.redFlags?.map((f,i)=><div key={i} style={{ fontSize:"0.78rem", padding:"4px 0", borderBottom:"1px solid var(--border)", color:"var(--text2)" }}>• {f}</div>)}
          </div>
          <div style={{ marginBottom:10 }}>
            <p style={{ fontSize:"0.75rem", fontWeight:600, color:"var(--success)", marginBottom:6 }}>✓ Verification Tips</p>
            {result.verificationTips?.map((t,i)=><div key={i} style={{ fontSize:"0.78rem", padding:"4px 0", borderBottom:"1px solid var(--border)", color:"var(--text2)" }}>→ {t}</div>)}
          </div>
          <div style={{ fontSize:"0.8rem", color:"var(--primary)", fontWeight:600, marginTop:8 }}>{result.recommendation}</div>
        </Card>
      )}
    </div>
  );
}

function ReturnPolicyTab() {
  const [form, setForm] = useState({ policyText:"", productName:"", platform:"" });
  const { result, loading, error, run } = useFeature(returnPolicyAnalyze);
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <Card>
        <p style={{ fontSize:"0.85rem", fontWeight:600, color:"var(--text2)", marginBottom:12 }}>Return policy analyze karo</p>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div><label style={lbl}>Product</label><input style={inp} onFocus={onF} onBlur={onB} value={form.productName} onChange={set("productName")} placeholder="TV, Phone..." /></div>
            <div><label style={lbl}>Platform</label><input style={inp} onFocus={onF} onBlur={onB} value={form.platform} onChange={set("platform")} placeholder="Amazon, Flipkart..." /></div>
          </div>
          <div><label style={lbl}>Return Policy Text paste karo *</label><textarea rows={5} style={{ ...inp, resize:"vertical" }} onFocus={onF} onBlur={onB} value={form.policyText} onChange={set("policyText")} placeholder="Copy paste karo website se return policy..." /></div>
          <Btn full onClick={()=>run(form)} disabled={loading||!form.policyText.trim()}>
            {loading?"Analyzing...":"📜 Analyze Policy"}
          </Btn>
        </div>
      </Card>
      {loading && <div style={{ display:"flex", justifyContent:"center", padding:32 }}><Spinner size={32} /></div>}
      {error && <Alert type="danger">{error}</Alert>}
      {result && (
        <Card style={{ animation:"fadeUp 0.4s ease both" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div>
              <Badge color={result.consumerFriendly?"success":"danger"}>{result.rating?.replace(/_/g," ")}</Badge>
              <div style={{ fontSize:"0.85rem", fontWeight:600, marginTop:6 }}>Return window: <span style={{ color:"var(--primary)" }}>{result.returnWindow}</span></div>
            </div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"var(--font-head)", fontSize:"1.5rem", fontWeight:800, color:result.friendlinessScore>60?"var(--success)":"var(--danger)" }}>{result.friendlinessScore}%</div>
              <div style={{ fontSize:"0.7rem", color:"var(--text3)" }}>Consumer Friendly</div>
            </div>
          </div>
          <p style={{ fontSize:"0.82rem", color:"var(--text2)", lineHeight:1.7, marginBottom:12 }}>{result.summary}</p>
          {result.hiddenClauses?.length>0 && (
            <div style={{ marginBottom:10 }}>
              <p style={{ fontSize:"0.75rem", fontWeight:600, color:"var(--danger)", marginBottom:6 }}>⚠ Hidden Clauses</p>
              {result.hiddenClauses.map((c,i)=><div key={i} style={{ fontSize:"0.78rem", padding:"4px 0", color:"var(--text2)", borderBottom:"1px solid var(--border)" }}>• {c}</div>)}
            </div>
          )}
          {result.keyPoints?.length>0 && (
            <div>
              <p style={{ fontSize:"0.75rem", fontWeight:600, color:"var(--success)", marginBottom:6 }}>✓ Key Points</p>
              {result.keyPoints.map((p,i)=><div key={i} style={{ fontSize:"0.78rem", padding:"4px 0", color:"var(--text2)", borderBottom:"1px solid var(--border)" }}>• {p}</div>)}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function BlacklistTab() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ sellerName:"", marketplace:"", reason:"", overprice:"" });
  const [reporting, setReporting] = useState(false);
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  useEffect(()=>{
    getBlacklist().then(({data})=>setSellers(data.sellers||[])).finally(()=>setLoading(false));
  },[]);

  const handleReport = async (e) => {
    e.preventDefault(); setReporting(true);
    try {
      await reportSeller({ ...form, overprice:parseFloat(form.overprice)||0 });
      const {data} = await getBlacklist();
      setSellers(data.sellers||[]);
      setForm({ sellerName:"", marketplace:"", reason:"", overprice:"" });
    } catch {}
    finally { setReporting(false); }
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <Card>
        <p style={{ fontSize:"0.85rem", fontWeight:600, color:"var(--text2)", marginBottom:12 }}>Seller report karo</p>
        <form onSubmit={handleReport} style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div><label style={lbl}>Seller Name *</label><input required style={inp} onFocus={onF} onBlur={onB} value={form.sellerName} onChange={set("sellerName")} placeholder="Seller ka naam" /></div>
            <div><label style={lbl}>Marketplace</label><input style={inp} onFocus={onF} onBlur={onB} value={form.marketplace} onChange={set("marketplace")} placeholder="Amazon, Flipkart" /></div>
          </div>
          <div><label style={lbl}>Reason</label><input style={inp} onFocus={onF} onBlur={onB} value={form.reason} onChange={set("reason")} placeholder="Fake products, overpricing..." /></div>
          <Btn type="submit" variant="danger" full disabled={reporting}>{reporting?"Reporting...":"🚫 Report Seller"}</Btn>
        </form>
      </Card>
      {loading ? <div style={{ display:"flex", justifyContent:"center", padding:32 }}><Spinner size={32} /></div> :
        sellers.length===0 ? <EmptyState icon="✅" title="No blacklisted sellers" subtitle="Community ne abhi kisi ko report nahi kiya" /> :
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <p style={{ fontSize:"0.78rem", color:"var(--text3)", fontWeight:500 }}>Community Reports ({sellers.length})</p>
          {sellers.map((s,i)=>(
            <Card key={i} style={{ padding:"12px", borderLeft:"3px solid var(--danger)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontWeight:600, fontSize:"0.88rem" }}>{s.sellerName}</div>
                  <div style={{ fontSize:"0.72rem", color:"var(--text3)", marginTop:2 }}>{s.marketplace} · {s.reportCount} reports</div>
                  {s.reasons?.[0] && <div style={{ fontSize:"0.72rem", color:"var(--danger)", marginTop:2 }}>"{s.reasons[0]}"</div>}
                </div>
                <Badge color="danger">{s.reportCount} reports</Badge>
              </div>
            </Card>
          ))}
        </div>
      }
    </div>
  );
}

export default function InsightsPage() {
  const [tab, setTab] = useState("report");
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <SectionHeader title="Insights & Tools" subtitle="Smart shopping analytics" icon="📊" />
      <div style={{ display:"flex", gap:4, overflowX:"auto", paddingBottom:4 }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            padding:"7px 10px", borderRadius:99, border:"1.5px solid",
            borderColor:tab===t.id?"var(--primary)":"var(--border)",
            background:tab===t.id?"var(--primary-bg)":"white",
            color:tab===t.id?"var(--primary)":"var(--text2)",
            fontSize:"0.72rem", fontWeight:600, whiteSpace:"nowrap",
            transition:"all 150ms", cursor:"pointer",
            display:"flex", alignItems:"center", gap:4,
          }}>
            <span style={{ fontSize:13 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>
      <div className="animate-fade-up">
        {tab==="report"       && <SpendingTab />}
        {tab==="budget"       && <BudgetTab />}
        {tab==="competitor"   && <CompetitorTab />}
        {tab==="fake"         && <FakeDetectTab />}
        {tab==="returnpolicy" && <ReturnPolicyTab />}
        {tab==="blacklist"    && <BlacklistTab />}
      </div>
    </div>
  );
}
