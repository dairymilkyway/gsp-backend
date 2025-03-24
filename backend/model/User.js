const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    email: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    password: {
        type: String,
        required: true,
        min: 6,
        max: 1024
    },
    role: {
        type: String,
        enum: ["user", "admin"], // Restricts role values
        default: "user" // Sets default role
    },
    otp: {
        type: String,
        required: false
    },
    otpExpires: {
        type: Date,
        required: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    gender: {
        type: String,
        enum: ["male", "female"], // Only 'male' and 'female' allowed
        required: false
    }
});

const UserModel = mongoose.model("users", UserSchema);

module.exports = UserModel;
