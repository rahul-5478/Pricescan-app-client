const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref:"User", required:true, index:true },
  productName: { type: String, required:true },
  category:    { type: String, default:"Other" },
  targetPrice: { type: Number },
  currentPrice:{ type: Number, required:true },
  currency:    { type: String, default:"INR" },
  marketplace: { type: String },
  lastAnalysis:{ type: Object },
  notifyBelow: { type: Number },
  isActive:    { type: Boolean, default:true },
}, { timestamps:true });

module.exports = mongoose.model("Wishlist", wishlistSchema);
