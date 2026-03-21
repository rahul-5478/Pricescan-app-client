const router = require("express").Router();
const { z } = require("zod");
const crypto = require("crypto");
const { authenticate } = require("../middleware/auth");
const { analyzeLimiter } = require("../middleware/rateLimiter");
const { getRedis } = require("../config/redis");
const Analysis = require("../models/Analysis");

const DJANGO_URL = process.env.DJANGO_SERVICE_URL || "http://localhost:8000";
const INTERNAL_TOKEN = process.env.INTERNAL_AUTH_TOKEN;

const analyzeSchema = z.object({
  productName: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  listedPrice: z.number().positive(),
  currency: z.string().default("USD"),
  description: z.string().max(2000).optional(),
  marketplace: z.string().max(100).optional(),
});

const makeCacheKey = (data) =>
  `analysis:${crypto
    .createHash("md5")
    .update(JSON.stringify({ ...data, listedPrice: Math.round(data.listedPrice) }))
    .digest("hex")}`;

// POST /api/analyze
router.post("/", authenticate, analyzeLimiter, async (req, res, next) => {
  try {
    const data = analyzeSchema.parse(req.body);
    const redis = getRedis();
    const cacheKey = makeCacheKey(data);

    // Check Redis cache
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        const analysis = await Analysis.create({
          userId: req.user._id,
          ...data,
          result: parsed,
          cached: true,
        });
        req.user.analysisCount += 1;
        await req.user.save();
        return res.json({ analysis, cached: true });
      }
    }

    // Forward to Django AI service
    const fetch = (await import("node-fetch")).default;
    const aiRes = await fetch(`${DJANGO_URL}/api/analyze/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Token": INTERNAL_TOKEN,
      },
      body: JSON.stringify(data),
    });

    if (!aiRes.ok) {
      const err = await aiRes.json().catch(() => ({}));
      return res.status(aiRes.status).json({ error: err.error || "AI service error" });
    }

    const result = await aiRes.json();

    // Cache result for 1 hour
    if (redis) {
      await redis.setex(cacheKey, 3600, JSON.stringify(result));
    }

    const analysis = await Analysis.create({
      userId: req.user._id,
      ...data,
      result,
    });

    req.user.analysisCount += 1;
    await req.user.save();

    res.json({ analysis, cached: false });
  } catch (err) {
    if (err.name === "ZodError") return res.status(400).json({ error: err.errors });
    next(err);
  }
});

module.exports = router;
