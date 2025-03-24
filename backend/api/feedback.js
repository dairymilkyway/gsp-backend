const FeedbackModel = require("../model/Feedback");
const connectToDatabase = require("../db");
const { verifyToken } = require("../middleware/auth");

module.exports = async (req, res) => {
  await connectToDatabase();

  if (req.method === "POST") {
    await verifyToken(req, res, async () => {
      const { name, rating, comment } = req.body;
      const feedback = new FeedbackModel({ name, rating, comment });
      const savedFeedback = await feedback.save();
      return res.status(201).json(savedFeedback);
    });
  } else if (req.method === "GET") {
    await verifyToken(req, res, async () => {
      const feedbacks = await FeedbackModel.find({});
      return res.status(200).json(feedbacks);
    });
  } else {
    // If any other method is used
    res.status(405).json({ error: "Method not allowed" });
  }
};
