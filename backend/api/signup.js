const bcrypt = require("bcrypt");
const UserModel = require("../model/User");
const generateOtp = require("../otp");
const sendOtpEmail = require("../mailer");
const connectToDatabase = require("../db");

module.exports = async (req, res) => {
  await connectToDatabase();

  try {
    const { name, email, password, gender } = req.body;

    // Check if email already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = "user"; // Default role is user
    let otp = null;
    let otpExpires = null;

    // Generate OTP if role is 'user'
    if (role === "user") {
      otp = generateOtp();
      otpExpires = Date.now() + 3600000; // 1 hour from now
      sendOtpEmail(email, otp);
    }

    // Create new user
    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
      role,
      otp,
      otpExpires,
      gender,
    });

    // Save the new user
    await newUser.save();
    res.status(201).json({
      message: "User created successfully. Please check your email for the OTP.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};