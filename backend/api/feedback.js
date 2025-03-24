const FeedbackModel = require("../model/Feedback");
const connectToDatabase = require("../db");

module.exports = async (req, res) => {
  await connectToDatabase();

  try {
    // POST - Submit Feedback
    if (req.method === "POST") {
      const { name, rating, comment } = req.body;

      // Create feedback with name (default to "Anonymous" if not provided)
      const feedback = new FeedbackModel({
        name: name || "Anonymous",
        rating,
        comment,
      });

      // Save feedback to the database
      const savedFeedback = await feedback.save();
      return res.status(201).json(savedFeedback);
    }

    // GET - Fetch All Feedbacks
    if (req.method === "GET") {
      const feedbacks = await FeedbackModel.find();
      return res.status(200).json(feedbacks);
    }

    // Method not allowed
    res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
