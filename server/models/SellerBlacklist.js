const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema({
  sellerName:  { type: String, required:true, index:true },
  marketplace: { type: String },
  reportCount: { type: Number, default:1 },
  reportedBy:  [{ type: mongoose.Schema.Types.ObjectId, ref:"User" }],
  reasons:     [{ type: String }],
  avgOverprice:{ type: Number, default:0 },
  verified:    { type: Boolean, default:false },
}, { timestamps:true });

module.exports = mongoose.model("SellerBlacklist", sellerSchema);
