const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    userId: String,
    fullName: String,
    sponsorId: String,
    sponsorName: String,
    investmentAmount: Number,
    roiIncome: Number,
    rewardIncome: Number,
    rankIncome: Number,
    rankBonusIncome: Number,
    levelIncome: Number,
    directIncome: Number,
    indirectIncome: Number,
    depositBalance: Number,
    totalIncome: Number,
    activeIncome: Number,
    joiningBonus: Number,
  },
  { timestamps: true }
);

const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet;
