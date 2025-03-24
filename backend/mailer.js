require("dotenv").config();
const nodemailer = require("nodemailer");
const fs = require('fs');
const path = require('path');

// Load and convert image to base64 when the module initializes
const logoPath = path.join(__dirname, 'https://i.ibb.co/yFtCPPHY/greenspherelogo.png');
let logoBase64 = '';

try {
  const logoFile = fs.readFileSync(logoPath);
  logoBase64 = `data:image/png;base64,${logoFile.toString('base64')}`;
} catch (error) {
  console.error('Error loading logo:', error);
  // Fallback to no logo if file can't be loaded
}

const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASSWORD,
    },
});

const sendOtpEmail = (email, otp) => {
    const mailOptions = {
        from: '"GreenSphere" <no-reply@greensphere.com>',
        to: email,
        subject: "Your GreenSphere OTP Code",
        html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0d0935; color: white; text-align: center;">
            <img src="${logoBase64}" alt="GreenSphere Logo" width="120" style="margin-bottom: 20px;"/>
            <h2 style="color: #32cd32;">Your OTP Code</h2>
            <p style="font-size: 16px; color: #ddd;">Use the following OTP to complete your verification:</p>
            <h1 style="font-size: 32px; background: #fff; color: #0d0935; padding: 10px; display: inline-block; border-radius: 8px;">${otp}</h1>
            <p style="color: #ddd; font-size: 14px;">This OTP is valid for 1 hour. If you didn't request this, please ignore this email.</p>
            <hr style="border: 0.5px solid #32cd32; margin: 20px auto; width: 80%;"/>
            <p style="font-size: 12px; color: #888;">GreenSphere | Protecting the Future 🌱</p>
        </div>
        `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("Error sending email:", error);
        } else {
            console.log("Email sent:", info.response);
        }
    });
};

module.exports = sendOtpEmail;
