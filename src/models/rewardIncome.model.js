const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema(
  {
    userId: String,
    fullName: String,
    sponsorId: String,
    sponsorName: String,
    rewardName: String,
    rewardPosition: Number,
    rewardAmount: Number,

    date: String,
    time: String,
    transactionId: String,
  },
  { timestamps: true }
);

const Reward = mongoose.model("Reward", rewardSchema);

module.exports = { Reward };
