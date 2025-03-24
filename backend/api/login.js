const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../model/User");
const connectToDatabase = require("../db");

module.exports = async (req, res) => {
  await connectToDatabase();

  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "No Records Found" });
    }

    // Compare the provided password with the hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Password does not match!" });
    }

    // If user is NOT verified, redirect them to verify OTP
    if (user.role === "user" && !user.isVerified) {
      return res.json({
        message: "Please verify your email with the OTP sent to you.",
        redirect: "/verify-otp",
        email,
      });
    }

    // Generate JWT token for verified users
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Return success response with user id
    res.json({
      message: "Success",
      id: user._id, // Add user id to response
      role: user.role,
      token, // Return the token to the client
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
