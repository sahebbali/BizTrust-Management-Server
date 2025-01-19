const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    userId: String,
    fullName: String,
    sponsorId: String,
    sponsorName: String,
    investmentAmount: { type: Number, default: 0 },
    roiIncome: { type: Number, default: 0 },
    rewardIncome: { type: Number, default: 0 },
    // rankIncome: Number,
    // rankBonusIncome: Number,
    levelIncome: { type: Number, default: 0 },
    // directIncome: Number,
    // indirectIncome: Number,
    depositBalance: { type: Number, default: 0 },
    totalIncome: { type: Number, default: 0 },
    activeIncome: { type: Number, default: 0 },
    // joiningBonus: Number,
  },
  { timestamps: true }
);

const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet;
