const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema(
  {
    userId: String,
    fullName: String,
    sponsorId: String,
    sponsorName: String,
    rewardDesignation: String,
    rewardPosition: Number,
    rewardAmount: Number,
    line1: Number,
    line2: Number,
    line3: Number,
    line4: Number,
    line5: Number,
    date: String,
    time: String,
    transactionId: String,
  },
  { timestamps: true }
);

const Reward = mongoose.model("Reward", rewardSchema);

module.exports = { Reward };
