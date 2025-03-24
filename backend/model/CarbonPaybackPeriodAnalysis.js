const mongoose = require("mongoose");

const CarbonPaybackPeriodSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  CarbonPaybackPeriod: { type: Number, required: true },
  TotalCarbonEmission: { type: Number, required: true },
});

module.exports = mongoose.model("CarbonPaybackPeriodAnalysis", CarbonPaybackPeriodSchema);
