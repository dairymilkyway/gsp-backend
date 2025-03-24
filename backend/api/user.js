const { verifyToken } = require("../middleware/auth");

module.exports = async (req, res) => {
  try {
    await verifyToken(req, res, () => {});

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.status(200).json({ user: req.user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};