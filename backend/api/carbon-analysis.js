const connectToDatabase = require("../db");
const CarbonAnalysisModel = require("../model/CarbonAnalysis");

module.exports = async (req, res) => {
  await connectToDatabase();

  try {
    if (req.method === "POST") {
      const { energyUsage, carbonEmissionFactor } = req.body;

      if (!energyUsage || !carbonEmissionFactor) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const totalCarbonEmission = energyUsage * carbonEmissionFactor;

      const carbonAnalysis = new CarbonAnalysisModel({
        energyUsage,
        carbonEmissionFactor,
        totalCarbonEmission,
      });

      const savedCarbonAnalysis = await carbonAnalysis.save();
      return res.status(201).json(savedCarbonAnalysis);
    }

    if (req.method === "GET") {
      const carbonAnalyses = await CarbonAnalysisModel.find();
      return res.status(200).json(carbonAnalyses);
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};