const RewardIncomeModel = require("../models/rewardIncome.model");
const User = require("../models/auth.model");
const getPSTime = require("../config/getPSTime");

const generateRandomString = require("../config/generateRandomId");
const { UpdateWallet } = require("./CheckUserEarningLimit");

const CreateRewardHistory = async (
  userId,
  designation,
  amount,
  position,
  line1,
  line2,
  line3,
  line4,
  line5
) => {
  console.log("reward income :", userId);
  const { date, time } = getPSTime();
  const currentUser = await User.findOne({ userId });

  if (!currentUser) {
    console.log("User not found:", userId);
    return;
  }

  // console.log("Current User:", currentUser);

  const existReward = await RewardIncomeModel.findOne({
    userId,
    rewardDesignation: designation,
    rewardPosition: position,
  });

  if (existReward) {
    console.log("Reward already exists for:", designation);
    return;
  }

  await RewardIncomeModel.create({
    userId: currentUser.userId,
    fullName: currentUser.fullName,
    sponsorId: currentUser.sponsorId,
    sponsorName: currentUser.sponsorName,
    rewardDesignation: designation,
    rewardPosition: position,
    rewardAmount: typeof amount === "number" ? amount : 0,
    rewardGift: typeof amount === "string" ? amount : "",
    line1,
    line2,
    line3,
    line4,
    line5,
    date: new Date(date).toDateString(),
    time,
    transactionId: generateRandomString(13),
  });
  await User.findOneAndUpdate(
    { userId: currentUser.userId },
    { $set: { openLevel: 5, rank: designation } },
    { new: true }
  );
  if (typeof amount === "number") {
    await UpdateWallet(currentUser.userId, amount, "reward-income");
  }
};

module.exports = CreateRewardHistory;
