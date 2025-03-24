const mongoose = require("mongoose");

const EnergyUsageBySourceSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  Type: { type: String, required: true },
  Emissions: { type: Number, required: true },
});

module.exports = mongoose.model("EnergyUsageBySource", EnergyUsageBySourceSchema);
