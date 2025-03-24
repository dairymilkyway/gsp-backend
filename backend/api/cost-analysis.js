const connectToDatabase = require("../db");
const CostAnalysisModel = require("../model/CostAnalysis");

module.exports = async (req, res) => {
  await connectToDatabase();

  try {
    if (req.method === "POST") {
      const { energyUsage, costPerUnit } = req.body;

      if (!energyUsage || !costPerUnit) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const totalCost = energyUsage * costPerUnit;

      const costAnalysis = new CostAnalysisModel({
        energyUsage,
        costPerUnit,
        totalCost,
      });

      const savedCostAnalysis = await costAnalysis.save();
      return res.status(201).json(savedCostAnalysis);
    }

    if (req.method === "GET") {
      const costAnalyses = await CostAnalysisModel.find();
      return res.status(200).json(costAnalyses);
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};