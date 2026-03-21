import { useState, useRef } from "react";
import api from "../services/api";
import CyberPanel from "../components/CyberPanel";
import CyberButton from "../components/CyberButton";

function parseCSV(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return { error: "CSV must have a header row and at least one data row." };
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/\s+/g,""));
  const required = ["productname","category","listedprice"];
  const missing = required.filter(r => !headers.includes(r));
  if (missing.length) return { error: `Missing columns: ${missing.join(", ")}` };

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(",").map(v => v.trim().replace(/^"|"$/g,""));
    const row = {};
    headers.forEach((h, idx) => { row[h] = vals[idx] || ""; });
    if (!row.productname || !row.listedprice) continue;
    rows.push({
      productName: row.productname,
      category:    row.category || "Other",
      listedPrice: parseFloat(row.listedprice),
      currency:    row.currency || "USD",
      marketplace: row.marketplace || "",
      description: row.description || "",
    });
  }
  if (!rows.length) return { error: "No valid rows found in CSV." };
  return { rows };
}

const SAMPLE_CSV = `productName,category,listedPrice,currency,marketplace
Sony WH-1000XM5,Audio & Headphones,399.99,USD,Amazon
iPhone 15 Pro 256GB,Smartphones,1099,USD,Apple Store
Samsung 65" QLED TV,Electronics,1299,USD,Flipkart
Nike Air Max 270,Shoes & Footwear,150,USD,Nike
Dyson V15 Vacuum,Appliances,749.99,USD,Amazon`;

export default function BulkPage() {
  const [rows, setRows]     = useState([]);
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState({}); // { idx: "pending"|"running"|"done"|"error" }
  const [running, setRunning] = useState(false);
  const [csvError, setCsvError] = useState("");
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      setCsvError("");
      const { rows: parsed, error } = parseCSV(e.target.result);
      if (error) { setCsvError(error); setRows([]); return; }
      setRows(parsed);
      setResults([]);
      setStatus({});
    };
    reader.readAsText(file);
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "sample_products.csv";
    a.click();
  };

  const runBulk = async () => {
    setRunning(true);
    const newResults = [...results];
    const newStatus = { ...status };

    for (let i = 0; i < rows.length; i++) {
      newStatus[i] = "running";
      setStatus({ ...newStatus });
      try {
        const { data } = await api.post("/analyze", rows[i]);
        newResults[i] = { ...data.analysis, _rowIdx: i };
        newStatus[i] = "done";
      } catch (err) {
        newResults[i] = { _rowIdx: i, _error: err.response?.data?.error || "Failed" };
        newStatus[i] = "error";
      }
      setResults([...newResults]);
      setStatus({ ...newStatus });
      // Small delay to avoid hammering the API
      if (i < rows.length - 1) await new Promise(r => setTimeout(r, 600));
    }
    setRunning(false);
  };

  const downloadResults = () => {
    const lines = ["productName,listedPrice,currency,verdict,estimatedFairPrice,overpricingPercent,confidenceScore"];
    results.forEach((r, i) => {
      if (!r || r._error) { lines.push(`${rows[i]?.productName || ""},,,ERROR,,,`); return; }
      lines.push([
        r.productName, r.listedPrice, r.currency,
        r.result?.verdict, r.result?.estimatedFairPrice,
        r.result?.overpricingPercent, r.result?.confidenceScore,
      ].join(","));
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "pricescan_results.csv";
    a.click();
  };

  const VERT_COLOR = { OVERPRICED:"var(--red)", FAIR:"var(--green)", UNDERPRICED:"var(--cyan)", UNKNOWN:"var(--text3)" };
  const done = results.filter(r => r && !r._error).length;
  const pct  = rows.length ? Math.round((Object.keys(status).length / rows.length) * 100) : 0;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div className="animate-fade-up">
        <div style={{ fontSize:"0.58rem", color:"var(--text3)", letterSpacing:"0.2em", marginBottom:4 }}>MODULE_03</div>
        <h1 style={{ fontSize:"1.5rem", color:"var(--cyan)", textShadow:"var(--glow-cyan)" }}>
          BULK <span style={{ color:"var(--text)" }}>ANALYZER</span>
        </h1>
        <div style={{ width:36, height:2, background:"var(--cyan)", marginTop:8, boxShadow:"var(--glow-cyan)" }} />
      </div>

      <CyberPanel className="animate-fade-up-2">
        <div style={{ fontSize:"0.58rem", color:"var(--text3)", letterSpacing:"0.18em", marginBottom:12 }}>CSV UPLOAD</div>
        <p style={{ fontSize:"0.72rem", color:"var(--text3)", marginBottom:16, lineHeight:1.7 }}>
          Upload a CSV with columns: <span style={{ color:"var(--cyan)" }}>productName, category, listedPrice</span>
          {" "}(currency, marketplace, description optional)
        </p>

        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              flex:1, minHeight:80, border:"1px dashed var(--border2)",
              display:"flex", alignItems:"center", justifyContent:"center", gap:12,
              cursor:"crosshair", transition:"all 150ms",
              background: "repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(0,229,255,0.01) 8px,rgba(0,229,255,0.01) 9px)",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor="var(--cyan)"; e.currentTarget.style.background="rgba(0,229,255,0.04)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border2)"; e.currentTarget.style.background="repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(0,229,255,0.01) 8px,rgba(0,229,255,0.01) 9px)"; }}
          >
            <span style={{ fontSize:20, color:"var(--cyan)", opacity:0.5 }}>▦</span>
            <span style={{ fontSize:"0.72rem", color:"var(--text3)" }}>
              {rows.length ? `${rows.length} rows loaded` : "Click to upload CSV"}
            </span>
          </div>
          <input ref={fileRef} type="file" accept=".csv" style={{ display:"none" }}
            onChange={e => handleFile(e.target.files?.[0])} />

          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <CyberButton variant="primary" size="sm" onClick={downloadSample}>SAMPLE CSV</CyberButton>
            {results.length > 0 && (
              <CyberButton variant="success" size="sm" onClick={downloadResults}>EXPORT RESULTS</CyberButton>
            )}
          </div>
        </div>

        {csvError && (
          <div style={{ marginTop:10, background:"rgba(255,59,92,0.08)", border:"1px solid rgba(255,59,92,0.3)", padding:"8px 12px", fontSize:"0.72rem", color:"var(--red)" }}>
            ✕ {csvError}
          </div>
        )}
      </CyberPanel>

      {rows.length > 0 && (
        <CyberPanel className="animate-fade-up-3">
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:10 }}>
            <div>
              <div style={{ fontSize:"0.58rem", color:"var(--text3)", letterSpacing:"0.18em", marginBottom:4 }}>
                QUEUE — {rows.length} PRODUCTS
              </div>
              {running && (
                <div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.6rem", color:"var(--text3)", marginBottom:4 }}>
                    <span>PROGRESS</span><span style={{ color:"var(--cyan)" }}>{pct}%</span>
                  </div>
                  <div style={{ width:200, height:2, background:"var(--border)" }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:"var(--cyan)", boxShadow:"var(--glow-cyan)", transition:"width 0.4s ease" }} />
                  </div>
                </div>
              )}
            </div>
            <CyberButton variant="solid" disabled={running} onClick={runBulk} size="lg">
              {running ? (
                <span style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:12, height:12, border:"1px solid #000", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
                  SCANNING {done}/{rows.length}...
                </span>
              ) : "> RUN BULK SCAN"}
            </CyberButton>
          </div>

          {/* Table */}
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.72rem" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid var(--border)" }}>
                  {["#","PRODUCT","CATEGORY","PRICE","STATUS","VERDICT","FAIR VALUE","Δ%"].map(h => (
                    <th key={h} style={{ padding:"8px 10px", textAlign:"left", color:"var(--text3)", fontSize:"0.58rem", letterSpacing:"0.12em", fontWeight:400 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const res   = results[i];
                  const stat  = status[i];
                  const verd  = res?.result?.verdict;
                  const color = VERT_COLOR[verd] || "var(--text3)";
                  return (
                    <tr key={i} style={{
                      borderBottom:"1px solid var(--border)",
                      background: stat === "running" ? "rgba(0,229,255,0.04)" : "transparent",
                      transition:"background 300ms",
                    }}>
                      <td style={{ padding:"8px 10px", color:"var(--text3)" }}>{i+1}</td>
                      <td style={{ padding:"8px 10px", maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{row.productName}</td>
                      <td style={{ padding:"8px 10px", color:"var(--text3)" }}>{row.category}</td>
                      <td style={{ padding:"8px 10px" }}>{row.currency} {row.listedPrice?.toLocaleString()}</td>
                      <td style={{ padding:"8px 10px" }}>
                        {!stat && <span style={{ color:"var(--text3)" }}>PENDING</span>}
                        {stat === "running" && <span style={{ color:"var(--cyan)", animation:"blink 1s infinite" }}>● SCANNING</span>}
                        {stat === "done"    && <span style={{ color:"var(--green)" }}>✓ DONE</span>}
                        {stat === "error"   && <span style={{ color:"var(--red)" }}>✕ ERROR</span>}
                      </td>
                      <td style={{ padding:"8px 10px", color, fontWeight:600 }}>{verd || "—"}</td>
                      <td style={{ padding:"8px 10px", color }}>{res?.result?.estimatedFairPrice ? `${row.currency} ${res.result.estimatedFairPrice?.toLocaleString()}` : "—"}</td>
                      <td style={{ padding:"8px 10px", color }}>
                        {res?.result?.overpricingPercent != null ? `${res.result.overpricingPercent > 0 ? "+" : ""}${res.result.overpricingPercent}%` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CyberPanel>
      )}
    </div>
  );
}
