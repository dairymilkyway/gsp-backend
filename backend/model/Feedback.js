const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 3,
        max: 255
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        min: 3,
        max: 1024
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const FeedbackModel = mongoose.model("feedbacks", FeedbackSchema);

module.exports = FeedbackModel;
