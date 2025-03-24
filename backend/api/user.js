const verifyUser = require("../middleware/verifyUser"); // Ensure this middleware exists and works correctly

module.exports = async (req, res) => {
  try {
    // Use the verifyUser middleware to authenticate the user
    await verifyUser(req, res);

    // If verifyUser passes, req.user should contain the authenticated user's details
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Respond with the authenticated user's details
    res.status(200).json({ user: req.user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};