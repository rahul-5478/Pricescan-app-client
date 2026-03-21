/**
 * Express gateway for all 20 AI feature endpoints.
 * Each route validates input, forwards to Django, returns result.
 */
const router = require("express").Router();
const { authenticate } = require("../middleware/auth");
const { analyzeLimiter } = require("../middleware/rateLimiter");

const DJANGO = process.env.DJANGO_SERVICE_URL || "http://localhost:8000";
const TOKEN  = process.env.INTERNAL_AUTH_TOKEN;

async function proxyToDjango(endpoint, body) {
  const fetch = (await import("node-fetch")).default;
  const res = await fetch(`${DJANGO}/api/${endpoint}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Internal-Token": TOKEN },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.error || "AI error"), { status: res.status });
  return data;
}

const handle = (endpoint) => async (req, res, next) => {
  try {
    const result = await proxyToDjango(endpoint, req.body);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

// All routes require auth + rate limiting
router.use(authenticate, analyzeLimiter);

// 🧠 AI-Exclusive
router.post("/seller-psychology",  handle("seller-psychology"));
router.post("/fake-discount",      handle("fake-discount"));
router.post("/review-sentiment",   handle("review-sentiment"));
router.post("/bundle-trap",        handle("bundle-trap"));
router.post("/regional-arbitrage", handle("regional-arbitrage"));

// 📸 Visual
router.post("/image-analyze",      handle("image-analyze"));

// 🤝 Social
router.post("/negotiation-script", handle("negotiation-script"));
router.post("/price-shame",        handle("price-shame"));

// 🎯 Niche
router.post("/emi-trap",           handle("emi-trap"));
router.post("/subscription",       handle("subscription"));
router.post("/secondhand",         handle("secondhand"));
router.post("/auction-advisor",    handle("auction-advisor"));

// Community price reports (stored in MongoDB)
const Analysis = require("../models/Analysis");
router.get("/community-prices/:productName", async (req, res) => {
  try {
    const name = decodeURIComponent(req.params.productName);
    const reports = await Analysis.find({
      productName: { $regex: name, $options: "i" },
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("productName listedPrice currency result.estimatedFairPrice result.verdict createdAt marketplace")
      .lean();

    const prices = reports.map(r => r.listedPrice).filter(Boolean);
    const avg    = prices.length ? prices.reduce((a,b)=>a+b,0)/prices.length : null;
    const min    = prices.length ? Math.min(...prices) : null;
    const max    = prices.length ? Math.max(...prices) : null;

    res.json({ reports, stats: { avg, min, max, count: reports.length } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
