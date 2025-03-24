const connectToDatabase = require("../db");
const EnergyUsageModel = require("../model/EnergyUsage");

module.exports = async (req, res) => {
  await connectToDatabase();

  try {
    if (req.method === "POST") {
      const { deviceName, usageHours, powerRating } = req.body;

      if (!deviceName || !usageHours || !powerRating) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const totalEnergyUsage = usageHours * powerRating;

      const energyUsage = new EnergyUsageModel({
        deviceName,
        usageHours,
        powerRating,
        totalEnergyUsage,
      });

      const savedEnergyUsage = await energyUsage.save();
      return res.status(201).json(savedEnergyUsage);
    }

    if (req.method === "GET") {
      const energyUsages = await EnergyUsageModel.find();
      return res.status(200).json(energyUsages);
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};