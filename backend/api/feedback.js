const FeedbackModel = require("../model/Feedback");
const connectToDatabase = require("../db");

module.exports = async (req, res) => {
  await connectToDatabase();

  try {
    if (req.method === "POST") {
      const { rating, comment } = req.body;

      const feedback = new FeedbackModel({
        name: req.body.name || "Anonymous",
        rating,
        comment,
      });

      const savedFeedback = await feedback.save();
      return res.status(201).json(savedFeedback);
    }

    if (req.method === "GET") {
      const feedbacks = await FeedbackModel.find();
      return res.status(200).json(feedbacks);
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};