const FeedbackModel = require("../model/Feedback");
const connectToDatabase = require("../db");
const { verifyUser } = require("../middleware/auth"); // Correct import

module.exports = async (req, res) => {
  await connectToDatabase();

  try {
    if (req.method === "POST") {
      // Authenticate the user
      await verifyUser(req, res, () => {});

      // If verifyUser fails, it will return an error response
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Extract name, rating, and comment from the request body
      const { rating, comment } = req.body;

      // Create new feedback with the logged-in user's name
      const feedback = new FeedbackModel({
        name: req.user.name, // Use the authenticated user's name
        rating,
        comment,
      });

      // Save feedback to the database
      const savedFeedback = await feedback.save();
      return res.status(201).json(savedFeedback);
    }

    if (req.method === "GET") {
      // Authenticate the user
      await verifyUser(req, res, () => {});

      // If verifyUser fails, it will return an error response
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Fetch feedbacks submitted by the logged-in user
      const feedbacks = await FeedbackModel.find({ name: req.user.name });
      return res.status(200).json(feedbacks);
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};