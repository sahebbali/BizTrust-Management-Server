const mongoose = require("mongoose");

const rewardIncomeSchema = new mongoose.Schema(
  {
    userId: String,
    fullName: String,
    sponsorId: String,
    sponsorName: String,
    rewardDesignation: String,
    rewardPosition: Number,
    rewardAmount: String,
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

const RewardIncomeModel = mongoose.model("Reward-Income", rewardIncomeSchema);

module.exports = RewardIncomeModel;
