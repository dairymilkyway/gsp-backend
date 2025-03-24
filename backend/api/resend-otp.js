const UserModel = require("../model/User");
const generateOtp = require("../otp");
const sendOtpEmail = require("../mailer");
const connectToDatabase = require("../db");

module.exports = async (req, res) => {
  await connectToDatabase();

  try {
    const { email } = req.body;

    // Check if the user exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a new OTP
    const otp = generateOtp();
    const otpExpires = Date.now() + 3600000; // OTP valid for 1 hour

    // Update the user's OTP and expiration time
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send the OTP via email
    await sendOtpEmail(email, otp);

    res.status(200).json({ message: "OTP has been resent to your email." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};