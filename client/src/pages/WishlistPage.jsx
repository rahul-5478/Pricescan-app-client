import { useState, useEffect } from "react";
import { Card, Btn, Input, Select, Badge, SectionHeader, Spinner, EmptyState, Alert } from "../components/UI";
import { getWishlist, addWishlist, removeWishlist } from "../services/advanced";
import { priceDropPredict } from "../services/advanced";

export default function WishlistPage() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding]   = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [predicting, setPredicting] = useState(null);
  const [predictions, setPredictions] = useState({});
  const [form, setForm] = useState({ productName:"", category:"", currentPrice:"", notifyBelow:"", currency:"INR", marketplace:"" });

  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  useEffect(() => {
    getWishlist().then(({data})=>setItems(data.items||[])).finally(()=>setLoading(false));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault(); setAdding(true);
    try {
      const { data } = await addWishlist({ ...form, currentPrice:parseFloat(form.currentPrice), notifyBelow:parseFloat(form.notifyBelow)||undefined });
      setItems(prev=>[data.item,...prev]);
      setForm({ productName:"", category:"", currentPrice:"", notifyBelow:"", currency:"INR", marketplace:"" });
      setShowForm(false);
    } catch {}
    finally { setAdding(false); }
  };

  const handleRemove = async (id) => {
    await removeWishlist(id);
    setItems(prev=>prev.filter(i=>i._id!==id));
  };

  const handlePredict = async (item) => {
    if (predictions[item._id]) return;
    setPredicting(item._id);
    try {
      const { data } = await priceDropPredict({
        productName:item.productName, category:item.category||"Other",
        currentPrice:item.currentPrice, currency:item.currency||"INR", marketplace:item.marketplace||"",
      });
      setPredictions(prev=>({...prev,[item._id]:data}));
    } catch {}
    finally { setPredicting(null); }
  };

  const CATS = ["Electronics","Smartphones","Audio","Laptops","Gaming","Appliances","Clothing","Shoes","Furniture","Other"];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <SectionHeader title="Smart Wishlist" subtitle="Save karo, best time pe kharido" icon="💛" />
        <Btn size="sm" onClick={()=>setShowForm(s=>!s)}>{showForm?"Cancel":"+ Add"}</Btn>
      </div>

      {showForm && (
        <Card style={{ animation:"fadeUp 0.3s ease both" }}>
          <p style={{ fontSize:"0.85rem", fontWeight:600, color:"var(--text2)", marginBottom:14 }}>Product add karo</p>
          <form onSubmit={handleAdd} style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <Input label="Product Name" value={form.productName} onChange={set("productName")} placeholder="Sony WH-1000XM5" required />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <Select label="Category" value={form.category} onChange={set("category")} options={["",  ...CATS].map(c=>({value:c,label:c||"Select..."}))} />
              <Input label="Current Price" type="number" value={form.currentPrice} onChange={set("currentPrice")} placeholder="34990" required />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:10 }}>
              <Input label="Notify me if price drops below" type="number" value={form.notifyBelow} onChange={set("notifyBelow")} placeholder="28000" hint="Optional target price" />
              <Select label="Currency" value={form.currency} onChange={set("currency")} options={["INR","USD","EUR","GBP"]} />
            </div>
            <Btn type="submit" full disabled={adding}>{adding?"Saving...":"Save to Wishlist 💛"}</Btn>
          </form>
        </Card>
      )}

      {loading ? (
        <div style={{ display:"flex", justifyContent:"center", padding:40 }}><Spinner size={32} /></div>
      ) : items.length===0 ? (
        <EmptyState icon="💛" title="Wishlist khaali hai" subtitle="Koi product add karo aur AI best time batayega" />
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {items.map(item => {
            const pred = predictions[item._id];
            return (
              <Card key={item._id} style={{ padding:"14px" }}>
                <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                  <div style={{ width:40, height:40, borderRadius:10, background:"#fffbeb", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>💛</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:"0.9rem", fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.productName}</div>
                    <div style={{ fontSize:"0.75rem", color:"var(--text3)", marginTop:2 }}>
                      {item.currency} {item.currentPrice?.toLocaleString()} · {item.category||"Other"}
                    </div>
                    {item.notifyBelow && (
                      <div style={{ fontSize:"0.72rem", color:"var(--primary)", marginTop:2 }}>
                        🔔 Alert: {item.currency} {item.notifyBelow?.toLocaleString()} se neeche
                      </div>
                    )}
                    {pred && (
                      <div style={{ marginTop:8, background:"var(--primary-bg)", borderRadius:8, padding:"8px 10px" }}>
                        <div style={{ fontSize:"0.72rem", fontWeight:600, color:"var(--primary)", marginBottom:4 }}>
                          📈 Price Prediction
                        </div>
                        {pred.predictions?.slice(0,2).map((p,i)=>(
                          <div key={i} style={{ fontSize:"0.7rem", color:"var(--text2)", display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                            <span>{p.event}</span>
                            <span style={{ color:"var(--success)", fontWeight:600 }}>↓ {p.dropPercent}% ({p.confidence}% conf)</span>
                          </div>
                        ))}
                        <div style={{ fontSize:"0.7rem", color:"var(--success)", marginTop:4, fontWeight:600 }}>
                          Best time: {pred.bestMonthToBuy}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    <button onClick={()=>handlePredict(item)} disabled={predicting===item._id||!!pred} style={{
                      padding:"4px 8px", borderRadius:7, border:"1px solid var(--primary)",
                      background:"var(--primary-bg)", color:"var(--primary)", fontSize:"0.68rem",
                      fontWeight:600, cursor:"pointer", whiteSpace:"nowrap",
                    }}>
                      {predicting===item._id ? "..." : pred ? "✓ Done" : "Predict"}
                    </button>
                    <button onClick={()=>handleRemove(item._id)} style={{
                      padding:"4px 8px", borderRadius:7, border:"1px solid var(--border)",
                      background:"transparent", color:"var(--text3)", fontSize:"0.68rem", cursor:"pointer",
                    }}>Remove</button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
