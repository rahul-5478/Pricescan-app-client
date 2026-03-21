import { useState, useRef } from "react";
import CyberPanel from "../components/CyberPanel";
import CyberButton from "../components/CyberButton";
import { TagList, SectionLabel, VerdictBadge, FeatureError, Spinner } from "../components/FeatureResult";
import { useFeature } from "../hooks/useFeature";
import * as F from "../services/features";

const MODES = [
  { id:"product",   label:"PRODUCT SCREENSHOT", icon:"📱", desc:"Amazon/Flipkart screenshot — auto-extract & analyze price" },
  { id:"receipt",   label:"RECEIPT SCANNER",    icon:"🧾", desc:"Upload a receipt — detect overcharging & billing errors" },
  { id:"price_tag", label:"PRICE TAG PHOTO",    icon:"🏷️", desc:"Offline store tag — compare with online prices instantly" },
];

export default function VisualAnalyzePage() {
  const [mode, setMode] = useState("product");
  const [preview, setPreview] = useState(null);
  const [b64, setB64] = useState(null);
  const [mtype, setMtype] = useState("image/jpeg");
  const fileRef = useRef();
  const { result, loading, error, run } = useFeature(F.imageAnalyze);

  const handleFile = (file) => {
    if (!file) return;
    setMtype(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = e => {
      setPreview(e.target.result);
      const base64 = e.target.result.split(",")[1];
      setB64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = () => {
    if (!b64) return;
    run({ imageBase64: b64, mediaType: mtype, mode });
  };

  const renderResult = () => {
    if (!result) return null;
    if (mode === "product") return <ProductResult r={result} />;
    if (mode === "receipt") return <ReceiptResult r={result} />;
    return <PriceTagResult r={result} />;
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div className="animate-fade-up">
        <div style={{ fontSize:"0.58rem", color:"var(--text3)", letterSpacing:"0.2em", marginBottom:4 }}>MODULE_07</div>
        <h1 style={{ fontSize:"1.5rem", color:"var(--cyan)", textShadow:"var(--glow-cyan)" }}>VISUAL <span style={{ color:"var(--text)" }}>ANALYZER</span></h1>
        <div style={{ width:36, height:2, background:"var(--cyan)", marginTop:8, boxShadow:"var(--glow-cyan)" }} />
      </div>

      {/* Mode selector */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
        {MODES.map(m=>(
          <div key={m.id} onClick={()=>setMode(m.id)} style={{
            background: mode===m.id?"rgba(0,229,255,0.06)":"var(--surface)",
            border: `1px solid ${mode===m.id?"var(--cyan)":"var(--border)"}`,
            borderTop: mode===m.id?"2px solid var(--cyan)":"2px solid transparent",
            padding:"16px", cursor:"crosshair", transition:"all 150ms",
            boxShadow: mode===m.id?"var(--glow-cyan)":"none",
          }}>
            <div style={{ fontSize:22, marginBottom:8 }}>{m.icon}</div>
            <div style={{ fontFamily:"var(--font-head)", fontSize:"0.68rem", color: mode===m.id?"var(--cyan)":"var(--text2)", letterSpacing:"0.08em", marginBottom:4 }}>{m.label}</div>
            <div style={{ fontSize:"0.62rem", color:"var(--text3)", lineHeight:1.5 }}>{m.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, alignItems:"start" }}>
        {/* Upload */}
        <CyberPanel className="animate-fade-up-2">
          <SectionLabel>UPLOAD IMAGE</SectionLabel>
          <div
            onClick={()=>fileRef.current?.click()}
            onDrop={e=>{ e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
            onDragOver={e=>e.preventDefault()}
            style={{
              border:"1px dashed var(--border2)", minHeight:200,
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              cursor:"crosshair", transition:"all 150ms", position:"relative", overflow:"hidden",
              background:"repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(0,229,255,0.01) 8px,rgba(0,229,255,0.01) 9px)",
            }}
            onMouseEnter={e=>e.currentTarget.style.borderColor="var(--cyan)"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border2)"}
          >
            {preview ? (
              <img src={preview} alt="preview" style={{ maxWidth:"100%", maxHeight:280, objectFit:"contain" }} />
            ) : (
              <div style={{ textAlign:"center", padding:20 }}>
                <div style={{ fontSize:40, opacity:0.2, marginBottom:10 }}>📸</div>
                <div style={{ fontSize:"0.68rem", color:"var(--text3)", letterSpacing:"0.1em" }}>CLICK OR DRAG TO UPLOAD</div>
                <div style={{ fontSize:"0.6rem", color:"var(--text3)", marginTop:4 }}>JPG, PNG, WEBP supported</div>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e=>handleFile(e.target.files?.[0])} />

          {preview && (
            <div style={{ marginTop:14, display:"flex", gap:10 }}>
              <CyberButton variant="solid" onClick={handleAnalyze} disabled={loading} style={{ flex:1 }}>
                {loading ? "ANALYZING WITH CLAUDE..." : `> ANALYZE ${MODES.find(m2=>m2.id===mode)?.label}`}
              </CyberButton>
              <CyberButton variant="danger" size="sm" onClick={()=>{ setPreview(null); setB64(null); }}>✕</CyberButton>
            </div>
          )}
        </CyberPanel>

        {/* Result */}
        <div>
          {loading && <Spinner />}
          {error && <FeatureError error={error} />}
          {!loading && !error && !result && (
            <div style={{ border:"1px dashed var(--border2)", padding:"50px 20px", textAlign:"center", color:"var(--text3)",
              background:"repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(0,229,255,0.01) 8px,rgba(0,229,255,0.01) 9px)" }}>
              <div style={{ fontSize:32, opacity:0.15, marginBottom:8 }}>👁</div>
              <div style={{ fontSize:"0.65rem", letterSpacing:"0.12em" }}>AWAITING IMAGE</div>
            </div>
          )}
          {result && renderResult()}
        </div>
      </div>
    </div>
  );
}

function ProductResult({ r }) {
  const pr = r.priceAnalysis || {};
  const vc = { OVERPRICED:"var(--red)", FAIR:"var(--green)", UNDERPRICED:"var(--cyan)" };
  const color = vc[pr.verdict] || "var(--text2)";
  return (
    <CyberPanel>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
        <SectionLabel>EXTRACTED PRODUCT</SectionLabel>
        {pr.verdict && <VerdictBadge verdict={pr.verdict} />}
      </div>
      {[["PRODUCT",r.productName],["PRICE",`${r.currency||""} ${r.price || r.extractedDetails?.price || ""}`],["MARKETPLACE",r.marketplace],["CATEGORY",r.category]].map(([k,v])=>v&&(
        <div key={k} style={{ display:"flex", gap:12, fontSize:"0.72rem", padding:"4px 0", borderBottom:"1px solid var(--border)" }}>
          <span style={{ width:90, color:"var(--text3)", fontSize:"0.6rem", letterSpacing:"0.1em", flexShrink:0 }}>{k}</span>
          <span style={{ color:"var(--text)" }}>{v}</span>
        </div>
      ))}
      {pr.reasoning && <div style={{ marginTop:12, fontSize:"0.72rem", color:"var(--text2)", lineHeight:1.7 }}>{pr.reasoning}</div>}
      {pr.redFlags?.length>0 && <div style={{ marginTop:12 }}><SectionLabel>RED FLAGS</SectionLabel><TagList items={pr.redFlags} color="var(--red)" /></div>}
      {pr.estimatedFairPrice && (
        <div style={{ marginTop:12, background:"var(--surface2)", padding:"10px 14px", display:"flex", justifyContent:"space-between" }}>
          <span style={{ fontSize:"0.65rem", color:"var(--text3)" }}>FAIR PRICE</span>
          <span style={{ fontFamily:"var(--font-head)", color, fontSize:"1.1rem" }}>{r.currency} {pr.estimatedFairPrice}</span>
        </div>
      )}
    </CyberPanel>
  );
}

function ReceiptResult({ r }) {
  const issueColor = s => s==="HIGH"?"var(--red)":s==="MEDIUM"?"var(--yellow)":"var(--text3)";
  return (
    <CyberPanel accent={r.issues?.length>0?"magenta":"green"}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
        <SectionLabel>RECEIPT ANALYSIS</SectionLabel>
        <VerdictBadge verdict={r.verdict} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
        {[["STORE",r.storeName],["DATE",r.date],["TOTAL",r.total],["OVERCHARGED",r.overchargedAmount]].map(([k,v])=>v&&(
          <div key={k} style={{ background:"var(--surface2)", padding:"8px 10px" }}>
            <div style={{ fontSize:"0.52rem", color:"var(--text3)", letterSpacing:"0.1em", marginBottom:2 }}>{k}</div>
            <div style={{ fontSize:"0.88rem", color: k==="OVERCHARGED"&&r.overchargedAmount>0?"var(--red)":"var(--text)" }}>{v}</div>
          </div>
        ))}
      </div>
      {r.issues?.length>0 && (
        <div>
          <SectionLabel>ISSUES FOUND ({r.issues.length})</SectionLabel>
          {r.issues.map((issue,i)=>(
            <div key={i} style={{ borderLeft:`2px solid ${issueColor(issue.severity)}`, padding:"8px 12px", marginBottom:8, background:"var(--surface2)" }}>
              <div style={{ fontSize:"0.68rem", fontWeight:600, color:"var(--text)", marginBottom:2 }}>{issue.item}</div>
              <div style={{ fontSize:"0.65rem", color:issueColor(issue.severity) }}>{issue.description}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop:10, fontSize:"0.72rem", color:"var(--cyan)" }}>{r.recommendation}</div>
    </CyberPanel>
  );
}

function PriceTagResult({ r }) {
  return (
    <CyberPanel>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
        <SectionLabel>PRICE TAG ANALYSIS</SectionLabel>
        <VerdictBadge verdict={r.verdict} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
        {[
          ["PRODUCT",r.productName],["STORE",r.store],
          ["TAGGED PRICE",r.taggedPrice],["ONLINE PRICE",r.estimatedOnlinePrice]
        ].map(([k,v])=>v&&(
          <div key={k} style={{ background:"var(--surface2)", padding:"8px 10px" }}>
            <div style={{ fontSize:"0.52rem", color:"var(--text3)", letterSpacing:"0.1em", marginBottom:2 }}>{k}</div>
            <div style={{ fontSize:"0.85rem", color:"var(--text)" }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize:"0.72rem", color:"var(--text2)", marginBottom:10 }}>{r.recommendation}</div>
      {r.whereToFindCheaper && <div style={{ fontSize:"0.68rem", color:"var(--cyan)" }}>💡 {r.whereToFindCheaper}</div>}
    </CyberPanel>
  );
}
