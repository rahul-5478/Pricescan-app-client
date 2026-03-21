require("dotenv").config();
const express  = require("express");
const cors     = require("cors");
const helmet   = require("helmet");
const morgan   = require("morgan");
const { connectDB }    = require("./config/db");
const { connectRedis } = require("./config/redis");
const authRoutes     = require("./routes/auth");
const analyzeRoutes  = require("./routes/analyze");
const historyRoutes  = require("./routes/history");
const featureRoutes  = require("./routes/features");
const advancedRoutes = require("./routes/advanced");
const { errorHandler } = require("./middleware/errorHandler");

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials:true }));
app.use(morgan("dev"));
app.use(express.json({ limit:"20mb" }));

app.use("/api/auth",     authRoutes);
app.use("/api/analyze",  analyzeRoutes);
app.use("/api/history",  historyRoutes);
app.use("/api/features", featureRoutes);
app.use("/api/advanced", advancedRoutes);

app.get("/api/health", (_,res) => res.json({ status:"ok", service:"express", version:"3.0" }));
app.use(errorHandler);

const start = async () => {
  await connectDB();
  await connectRedis();
  app.listen(PORT, () => console.log(`🚀 Express running on port ${PORT}`));
};
start();
