const router = require("express").Router();
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const User = require("../models/User");
const { authenticate } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "15m" });

const signRefresh = (userId) =>
  jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).max(60),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/register
router.post("/register", authLimiter, async (req, res, next) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const user = await User.create({ email, password, name });
    const accessToken = signToken(user._id);
    const refreshToken = signRefresh(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({ accessToken, refreshToken, user });
  } catch (err) {
    if (err.name === "ZodError") return res.status(400).json({ error: err.errors });
    next(err);
  }
});

// POST /api/auth/login
router.post("/login", authLimiter, async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const accessToken = signToken(user._id);
    const refreshToken = signRefresh(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.json({ accessToken, refreshToken, user });
  } catch (err) {
    if (err.name === "ZodError") return res.status(400).json({ error: err.errors });
    next(err);
  }
});

// POST /api/auth/refresh
router.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: "No refresh token" });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const accessToken = signToken(user._id);
    res.json({ accessToken });
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }
});

// POST /api/auth/logout
router.post("/logout", authenticate, async (req, res) => {
  req.user.refreshToken = null;
  await req.user.save();
  res.json({ message: "Logged out" });
});

// GET /api/auth/me
router.get("/me", authenticate, (req, res) => res.json({ user: req.user }));

module.exports = router;
