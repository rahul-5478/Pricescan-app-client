const router = require("express").Router();
const { authenticate } = require("../middleware/auth");
const Analysis = require("../models/Analysis");

// GET /api/history?page=1&limit=10
router.get("/", authenticate, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const [analyses, total] = await Promise.all([
      Analysis.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Analysis.countDocuments({ userId: req.user._id }),
    ]);

    res.json({
      analyses,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/history/:id
router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const analysis = await Analysis.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!analysis) return res.status(404).json({ error: "Analysis not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
