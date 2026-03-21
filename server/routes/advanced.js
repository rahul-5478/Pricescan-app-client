const router = require("express").Router();
const { authenticate } = require("../middleware/auth");
const { analyzeLimiter } = require("../middleware/rateLimiter");
const Wishlist = require("../models/Wishlist");
const Budget = require("../models/Budget");
const SellerBlacklist = require("../models/SellerBlacklist");
const Analysis = require("../models/Analysis");

const DJANGO = process.env.DJANGO_SERVICE_URL || "http://localhost:8000";
const TOKEN  = process.env.INTERNAL_AUTH_TOKEN;

async function ai(endpoint, body) {
  const fetch = (await import("node-fetch")).default;
  const res = await fetch(`${DJANGO}/api/${endpoint}/`, {
    method:"POST",
    headers:{ "Content-Type":"application/json", "X-Internal-Token":TOKEN },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.error||"AI error"), { status:res.status });
  return data;
}

router.use(authenticate);

// ── SHOPPING ASSISTANT ────────────────────────────────────
router.post("/chat", analyzeLimiter, async (req, res, next) => {
  try {
    const history = await Analysis.find({ userId:req.user._id }).sort({ createdAt:-1 }).limit(5).lean();
    const result = await ai("shopping-assistant", {
      message: req.body.message,
      scanHistory: history,
      budgetInfo: req.body.budgetInfo || "",
    });
    res.json(result);
  } catch(e) { next(e); }
});

// ── PRICE DROP PREDICTOR ──────────────────────────────────
router.post("/price-drop", analyzeLimiter, async (req,res,next) => {
  try { res.json(await ai("price-drop-predict", req.body)); }
  catch(e) { next(e); }
});

// ── FAKE PRODUCT DETECTOR ─────────────────────────────────
router.post("/fake-product", analyzeLimiter, async (req,res,next) => {
  try { res.json(await ai("fake-product", req.body)); }
  catch(e) { next(e); }
});

// ── RETURN POLICY ANALYZER ────────────────────────────────
router.post("/return-policy", analyzeLimiter, async (req,res,next) => {
  try { res.json(await ai("return-policy", req.body)); }
  catch(e) { next(e); }
});

// ── COMPETITOR PRICES ─────────────────────────────────────
router.post("/competitor-prices", analyzeLimiter, async (req,res,next) => {
  try { res.json(await ai("competitor-prices", req.body)); }
  catch(e) { next(e); }
});

// ── SPENDING REPORT ───────────────────────────────────────
router.post("/spending-report", async (req,res,next) => {
  try {
    const month = req.body.month || new Date().toISOString().slice(0,7);
    const [y,m] = month.split("-");
    const start = new Date(y, m-1, 1);
    const end   = new Date(y, m, 1);
    const analyses = await Analysis.find({
      userId: req.user._id,
      createdAt:{ $gte:start, $lt:end },
    }).lean();
    const result = await ai("spending-report", {
      analyses: analyses.map(a=>({
        productName:a.productName, category:a.category,
        listedPrice:a.listedPrice, currency:a.currency,
        verdict:a.result?.verdict, overpricingPercent:a.result?.overpricingPercent,
        estimatedFairPrice:a.result?.estimatedFairPrice,
      })),
      month, currency:req.body.currency||"INR",
    });
    res.json(result);
  } catch(e) { next(e); }
});

// ── PRICE MANIPULATION ────────────────────────────────────
router.post("/price-manipulation", analyzeLimiter, async (req,res,next) => {
  try { res.json(await ai("price-manipulation", req.body)); }
  catch(e) { next(e); }
});

// ── WISHLIST ──────────────────────────────────────────────
router.get("/wishlist", async (req,res,next) => {
  try {
    const items = await Wishlist.find({ userId:req.user._id, isActive:true }).sort({ createdAt:-1 });
    res.json({ items });
  } catch(e) { next(e); }
});

router.post("/wishlist", async (req,res,next) => {
  try {
    const item = await Wishlist.create({ userId:req.user._id, ...req.body });
    res.status(201).json({ item });
  } catch(e) { next(e); }
});

router.delete("/wishlist/:id", async (req,res,next) => {
  try {
    await Wishlist.findOneAndUpdate({ _id:req.params.id, userId:req.user._id }, { isActive:false });
    res.json({ message:"Removed" });
  } catch(e) { next(e); }
});

// ── BUDGET ────────────────────────────────────────────────
router.get("/budget", async (req,res,next) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0,7);
    let budget = await Budget.findOne({ userId:req.user._id, month });
    if (!budget) budget = { monthlyLimit:0, spent:0, currency:"INR", month };
    // Calculate actual spent from analyses this month
    const [y,m] = month.split("-");
    const analyses = await Analysis.find({
      userId:req.user._id,
      createdAt:{ $gte:new Date(y,m-1,1), $lt:new Date(y,m,1) },
    }).lean();
    const spent = analyses.reduce((sum,a)=>sum+a.listedPrice,0);
    res.json({ budget, spent, analysesCount:analyses.length });
  } catch(e) { next(e); }
});

router.post("/budget", async (req,res,next) => {
  try {
    const month = req.body.month || new Date().toISOString().slice(0,7);
    const budget = await Budget.findOneAndUpdate(
      { userId:req.user._id, month },
      { ...req.body, userId:req.user._id, month },
      { upsert:true, new:true }
    );
    res.json({ budget });
  } catch(e) { next(e); }
});

// ── SELLER BLACKLIST ──────────────────────────────────────
router.get("/blacklist", async (req,res,next) => {
  try {
    const sellers = await SellerBlacklist.find().sort({ reportCount:-1 }).limit(50);
    res.json({ sellers });
  } catch(e) { next(e); }
});

router.post("/blacklist/report", async (req,res,next) => {
  try {
    const { sellerName, marketplace, reason, overprice } = req.body;
    let seller = await SellerBlacklist.findOne({ sellerName:{ $regex:sellerName,$options:"i" } });
    if (seller) {
      if (!seller.reportedBy.includes(req.user._id)) {
        seller.reportCount++;
        seller.reportedBy.push(req.user._id);
        if (reason) seller.reasons.push(reason);
        if (overprice) seller.avgOverprice = (seller.avgOverprice + overprice) / 2;
        await seller.save();
      }
    } else {
      seller = await SellerBlacklist.create({
        sellerName, marketplace, reasons:[reason].filter(Boolean),
        reportedBy:[req.user._id], avgOverprice:overprice||0,
      });
    }
    res.json({ seller });
  } catch(e) { next(e); }
});

module.exports = router;
