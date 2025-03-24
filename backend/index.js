require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require('jsonwebtoken'); // For generating JWT tokens
const bcrypt = require("bcrypt");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const UserModel = require("./model/User");
const FeedbackModel = require("./model/Feedback");
const { verifyUser } = require("./middleware/auth");
const sendOtpEmail = require('./mailer');
const generateOtp = require('./otp');
const CostAnalysis = require("./model/CostAnalysis");
const CarbonPaybackPeriodAnalysis = require("./model/CarbonPaybackPeriodAnalysis");
const EnergyUsageBySourceModel = require('./model/EnergyUsageBySource');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8082; // Use port from .env or default to 8082
const MONGO_URI = process.env.MONGO_URI;

const corsOptions = {
  origin: '*', // Allow requests from this origin
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};
app.use(cors(corsOptions));

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGO_URI }),
  cookie: { secure: false } // Set to true if using HTTPS
}));

app.post("/signup", async (req, res) => {
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

    // Create new user with gender included
    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
      role,
      otp,
      otpExpires,
      gender, // Add gender to the user
    });

    // Save the new user
    const savedUser = await newUser.save();
    res.status(201).json({
      message: "User created successfully. Please check your email for the OTP if you are a user.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post("/login", async (req, res) => {
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
              email: email, // Send email for use in frontend
          });
      }

      // Generate JWT token for verified users
      const token = jwt.sign(
          { id: user._id, email: user.email, role: user.role }, // Payload
          process.env.JWT_SECRET, // Secret key
          { expiresIn: '24h' } // Token expiration
      );

      // Store user session after verification
      req.session.user = {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
      };

      // Set the token in a secure HTTP-only cookie
      res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', // Ensure cookies are only sent over HTTPS in production
          sameSite: 'strict', // Prevent CSRF attacks
      });

      // Return success response with user details and token
      return res.json({
          message: "Success",
          role: user.role,
          user: {
              id: user._id,
              name: user.name,
              email: user.email,
          },
          token: token, // Include the token in the response body
      });
  } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ error: err.message });
  }
});
// Feedback functionality
app.post("/feedback", async (req, res) => {
  try {
      if (!req.session.user) {
          return res.status(401).json("Not Authenticated");
      }

      const { rating, comment } = req.body;
      const feedback = new FeedbackModel({
          name: req.session.user.name,
          rating,
          comment
      });
      const savedFeedback = await feedback.save();
      res.status(201).json(savedFeedback);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

app.get("/feedback", async (req, res) => {
  try {
      const feedbacks = await FeedbackModel.find();
      res.status(200).json(feedbacks);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

app.get('/user', verifyUser, (req, res) => {
  // If verifyUser passes, the user is authenticated, and req.user should contain the user details
  res.json({ user: req.user });
});

app.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }
    user.isVerified = true;
    user.otp = null; // Clear the OTP
    user.otpExpires = null; // Clear the OTP expiration
    await user.save();
    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the user exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate new OTP
    const newOtp = generateOtp();
    const otpExpires = Date.now() + 3600000; // Expires in 1 hour

    // Update user record with new OTP
    user.otp = newOtp;
    user.otpExpires = otpExpires;
    await user.save();

    // Resend OTP via email
    sendOtpEmail(email, newOtp);

    res.json({ message: "A new OTP has been sent to your email." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/** ➤ Save Cost Analysis */
app.post("/api/cost-analysis", async (req, res) => {
  try {
      console.log("📩 Received Cost Analysis Request:", req.body);
      const { user_id, TotalProductCost, TotalInstallationCost, TotalMaintenanceCost } = req.body;

      if (!user_id || !TotalProductCost || !TotalInstallationCost || !TotalMaintenanceCost) {
          return res.status(400).json({ error: "❌ Missing required fields" });
      }

      const GrandTotal = TotalProductCost + TotalInstallationCost + TotalMaintenanceCost;
      const newCostAnalysis = new CostAnalysis({ user_id, TotalProductCost, TotalInstallationCost, TotalMaintenanceCost, GrandTotal });

      await newCostAnalysis.save();
      console.log("✅ Cost Analysis Saved:", newCostAnalysis);
      res.status(201).json({ message: "✅ Cost Analysis Saved", data: newCostAnalysis });

  } catch (error) {
      console.error("❌ Error saving cost analysis:", error);
      res.status(500).json({ error: error.message });
  }
});

/** ➤ Save Carbon Payback Period Analysis */
app.post("/api/carbon-analysis", async (req, res) => {
  try {
      console.log("📩 Received Carbon Payback Analysis Request:", req.body);
      const { user_id, CarbonPaybackPeriod, TotalCarbonEmission } = req.body;

      if (!user_id || !CarbonPaybackPeriod || !TotalCarbonEmission) {
          return res.status(400).json({ error: "❌ Missing required fields" });
      }

      const newCarbonAnalysis = new CarbonPaybackPeriodAnalysis({ user_id, CarbonPaybackPeriod, TotalCarbonEmission });

      await newCarbonAnalysis.save();
      console.log("✅ Carbon Payback Analysis Saved:", newCarbonAnalysis);
      res.status(201).json({ message: "✅ Carbon Payback Analysis Saved", data: newCarbonAnalysis });

  } catch (error) {
      console.error("❌ Error saving carbon analysis:", error);
      res.status(500).json({ error: error.message });
  }
});

/** ➤ Save Energy Usage By Source */
app.post("/api/energy-usage", async (req, res) => {
  try {
      console.log("📩 Received Energy Usage Request:", req.body);
      const { user_id, Type, Emissions } = req.body;

      if (!user_id || !Type || !Emissions) {
          return res.status(400).json({ error: "❌ Missing required fields" });
      }

      const newEnergyUsage = new EnergyUsageBySourceModel({ user_id, Type, Emissions });

      await newEnergyUsage.save();
      console.log("✅ Energy Usage Saved:", newEnergyUsage);
      res.status(201).json({ message: "✅ Energy Usage Saved", data: newEnergyUsage });

  } catch (error) {
      console.error("❌ Error saving energy usage:", error);
      res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});