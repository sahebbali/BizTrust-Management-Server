const mongoose = require("mongoose");
const mongoosePlugin = require("mongoose-paginate-v2");

const rankSchema = new mongoose.Schema(
  {
    userId: String,
    fullName: String,
    sponsorId: String,
    sponsorName: String,
    rank: String,
    rankPosition: Number,
    rewardAmount: Number,
    bonusAmount: Number,
    requiredDirectActiveUsers: Number,
    requiredDirectLevelAmount: Number,
    requiredAllLevelAmount: Number,
    totalDirectActiveUsers: Number,
    totalDirectLevelAmount: Number,
    totalAllLevelAmount: Number,
    date: String,
    time: String,
    transactionId: String,
  },
  { timestamps: true }
);
rankSchema.index({ bonusAmount: 1 });
rankSchema.plugin(mongoosePlugin);
const RankIncome = mongoose.model("rankIncome", rankSchema);

const rankTrackerSchema = new mongoose.Schema(
  {
    userId: String,
    fullName: String,
    sponsorId: String,
    sponsorName: String,
    rankStatus: Boolean,
    rank: String,
    currentRank: String,
    rankAchieveDate: String,
    directActiveTeamCount: Number,
    directActiveTeamTotalBusiness: Number,
    allActiveTeamTotalBusiness: Number,
  },
  { timestamps: true }
);

rankTrackerSchema.plugin(mongoosePlugin);
const RankTracker = mongoose.model(
  "RankTracker",
  rankTrackerSchema
);

module.exports = { RankIncome, RankTracker };
