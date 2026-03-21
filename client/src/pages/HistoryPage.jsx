import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { Card, Badge, Btn, SectionHeader, Spinner, EmptyState } from "../components/UI";

const VC = { OVERPRICED:"danger", FAIR:"success", UNDERPRICED:"info", UNKNOWN:"gray" };
const VI = { OVERPRICED:"⚠️", FAIR:"✅", UNDERPRICED:"🔽", UNKNOWN:"❓" };
const VL = { OVERPRICED:"Overpriced", FAIR:"Fair Price", UNDERPRICED:"Underpriced", UNKNOWN:"Unknown" };

const FILTERS = ["All","OVERPRICED","FAIR","UNDERPRICED"];

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage]     = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const fetchHistory = useCallback(async (p=1) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/history?page=${p}&limit=15`);
      setAnalyses(data.analyses); setPagination(data.pagination); setPage(p);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchHistory(1); }, [fetchHistory]);

  const handleDelete = async (id) => {
    if (!confirm("Delete karna chahte ho?")) return;
    await api.delete(`/history/${id}`);
    setAnalyses(prev => prev.filter(a=>a._id!==id));
  };

  const filtered = filter==="All" ? analyses : analyses.filter(a=>a.result?.verdict===filter);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <SectionHeader title="Scan History" subtitle="Tumhare past analyses" icon="📋" />

      {/* Filter pills */}
      <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4 }}>
        {FILTERS.map(f => (
          <button key={f} onClick={()=>setFilter(f)} style={{
            padding:"6px 14px", borderRadius:99, border:"1.5px solid",
            borderColor: filter===f ? "var(--primary)" : "var(--border)",
            background: filter===f ? "var(--primary-bg)" : "white",
            color: filter===f ? "var(--primary)" : "var(--text2)",
            fontSize:"0.78rem", fontWeight:600, whiteSpace:"nowrap",
            transition:"all 150ms",
          }}>{f}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display:"flex", justifyContent:"center", padding:40 }}><Spinner size={32} /></div>
      ) : filtered.length===0 ? (
        <EmptyState icon="📭" title="Koi record nahi" subtitle={filter==="All" ? "Pehle koi product scan karo" : `Koi ${filter} result nahi mila`} />
      ) : (
        <>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {filtered.map(a => (
              <Card key={a._id} style={{ padding:"14px" }}>
                <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                  <span style={{ fontSize:24, flexShrink:0 }}>{VI[a.result?.verdict]||"❓"}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:"0.9rem", fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.productName}</div>
                    <div style={{ fontSize:"0.75rem", color:"var(--text3)", marginTop:2 }}>
                      {a.currency} {a.listedPrice?.toLocaleString()} • {a.category}
                    </div>
                    {a.result?.estimatedFairPrice && (
                      <div style={{ fontSize:"0.75rem", marginTop:3, display:"flex", gap:8 }}>
                        <span style={{ color:"var(--text3)" }}>Fair: <strong>{a.currency} {a.result.estimatedFairPrice?.toLocaleString()}</strong></span>
                        {a.result.overpricingPercent!==0 && (
                          <span style={{ color: a.result.verdict==="OVERPRICED"?"var(--danger)":"var(--success)", fontWeight:600 }}>
                            {a.result.overpricingPercent>0?"+":""}{a.result.overpricingPercent}%
                          </span>
                        )}
                      </div>
                    )}
                    <div style={{ fontSize:"0.7rem", color:"var(--text3)", marginTop:4 }}>
                      {new Date(a.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                      {a.cached && <span style={{ marginLeft:6, color:"var(--primary)" }}>⚡ cached</span>}
                    </div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:8, alignItems:"flex-end" }}>
                    <Badge color={VC[a.result?.verdict]||"gray"}>{VL[a.result?.verdict]||"Unknown"}</Badge>
                    <button onClick={()=>handleDelete(a._id)} style={{
                      width:28, height:28, borderRadius:8, background:"var(--bg2)",
                      border:"1px solid var(--border)", color:"var(--text3)", fontSize:"0.75rem",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      transition:"all 150ms",
                    }}
                    onMouseEnter={e=>{e.currentTarget.style.background="var(--danger-bg)";e.currentTarget.style.color="var(--danger)";}}
                    onMouseLeave={e=>{e.currentTarget.style.background="var(--bg2)";e.currentTarget.style.color="var(--text3)";}}>
                      ✕
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {pagination && pagination.pages>1 && (
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"4px 0" }}>
              <Btn variant="outline" size="sm" disabled={page<=1} onClick={()=>fetchHistory(page-1)}>← Prev</Btn>
              <span style={{ fontSize:"0.8rem", color:"var(--text3)" }}>Page {page} of {pagination.pages}</span>
              <Btn variant="outline" size="sm" disabled={page>=pagination.pages} onClick={()=>fetchHistory(page+1)}>Next →</Btn>
            </div>
          )}
        </>
      )}
    </div>
  );
}
