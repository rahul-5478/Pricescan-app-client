const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    productName: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    listedPrice: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    description: { type: String },
    marketplace: { type: String },
    result: {
      verdict: { type: String, enum: ["OVERPRICED", "FAIR", "UNDERPRICED", "UNKNOWN"] },
      overpricingPercent: { type: Number },
      estimatedFairPrice: { type: Number },
      confidenceScore: { type: Number, min: 0, max: 100 },
      reasoning: { type: String },
      redFlags: [{ type: String }],
      suggestions: [{ type: String }],
      marketComparison: { type: String },
    },
    cached: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Analysis", analysisSchema);
