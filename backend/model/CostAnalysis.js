const mongoose = require("mongoose");

const CostAnalysisSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  TotalProductCost: { type: Number, required: true },
  TotalInstallationCost: { type: Number, required: true },
  TotalMaintenanceCost: { type: Number, required: true },
  GrandTotal: { type: Number, required: true },
});

module.exports = mongoose.model("CostAnalysis", CostAnalysisSchema);
