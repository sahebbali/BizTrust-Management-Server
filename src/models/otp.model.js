const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
    {
        email: String,
        userId: String,
        code: String,
        expireIn: Number,
    },
    { timestamps: true }
)
otpSchema.index({ "createdAt": 1 }, { expireAfterSeconds: 180 })
const Otp = new mongoose.model('Otp', otpSchema);

module.exports = Otp;