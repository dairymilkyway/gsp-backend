const FeedbackModel = require("../model/Feedback");
const connectToDatabase = require("../db");
const { verifyUser } = require("../middleware/auth"); // Ensure verifyUser middleware is used

module.exports = async (req, res) => {
  await connectToDatabase();

  try {
    // POST - Submit Feedback with Session Auth
    if (req.method === "POST") {
      // Check if the user is authenticated
      if (!req.session || !req.session.user) {
        return res.status(401).json({ error: "Not Authenticated" });
      }

      // Extract rating and comment from the request body
      const { rating, comment } = req.body;

      // Create new feedback with user name from session
      const feedback = new FeedbackModel({
        name: name, // Use name from session
        rating,
        comment,
      });

      // Save feedback to the database
      const savedFeedback = await feedback.save();
      return res.status(201).json(savedFeedback);
    }

    // GET - Fetch Feedbacks for the Logged-in User
    if (req.method === "GET") {
      // Authenticate the user
      await verifyUser(req, res);

      // If verifyUser fails, it will return an error response
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Fetch feedbacks submitted by the logged-in user
      const feedbacks = await FeedbackModel.find({ name: req.user.name });
      return res.status(200).json(feedbacks);
    }

    // Method not allowed
    res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};