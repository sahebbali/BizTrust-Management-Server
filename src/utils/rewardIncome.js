const Level = require("../models/level.model");
const RewardIncomeModel = require("../models/rewardIncome.model");
const CalculateLinePackageAmount = require("./CalculateLinePackageAmount");
const User = require("../models/auth.model");
const getPSTime = require("../config/getPSTime");
const { UpdateWallet } = require("./checkPackageLimit");
const generateRandomString = require("../config/generateRandomId");

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

const rewardIncome = async (userId) => {
  try {
    console.log("Fetching levels for user:", userId);

    const levels = await Level.findOne({ userId });
    if (!levels) {
      console.log("No levels found for user:", userId);
      return [];
    }

    const distributorLvl = levels.level?.filter((d) => d.level === "1") || [];
    console.log("Filtered Level 1 Users:", distributorLvl);

    let allLine = await Promise.all(
      distributorLvl.map(async (user) =>
        CalculateLinePackageAmount(user.userId)
      )
    );

    allLine.sort((a, b) => b.totalInvestmentAmount - a.totalInvestmentAmount);
    console.log("Calculated Line Packages (Sorted):", allLine);
    const line1 = allLine[0]?.totalInvestmentAmount || 0;
    const line2 = allLine[1]?.totalInvestmentAmount || 0;
    const line3 = allLine[2]?.totalInvestmentAmount || 0;
    const line4 = allLine[3]?.totalInvestmentAmount || 0;
    const line5 = allLine[4]?.totalInvestmentAmount || 0;
    console.log({ line1, line2, line3, line4, line5 });
    // await CreateRewardHistory(
    //   userId,
    //   "Relationship Manager",
    //   150000,
    //   1,
    //   line1,
    //   line2
    // );
    if (allLine.length >= 2 && line1 >= 3000000 && line2 >= 1500000) {
      await CreateRewardHistory(
        userId,
        "Relationship Manager",
        150000,
        1,
        line1,
        line2
      );
    } else if (
      allLine.length >= 3 &&
      line1 >= 6000000 &&
      line2 >= 5000000 &&
      line3 >= 4000000
    ) {
      await CreateRewardHistory(
        userId,
        "Branch Manager",
        300000,
        2,
        line1,
        line2,
        line3
      );
    } else if (
      allLine.length >= 4 &&
      line1 >= 60000000 &&
      line2 >= 60000000 &&
      line3 >= 45000000 &&
      line4 >= 1000000
    ) {
      await CreateRewardHistory(
        userId,
        "Area Manager",
        "1300CC CAR",
        3,
        line1,
        line2,
        line3,
        line4
      );
    } else if (
      allLine.length >= 5 &&
      line1 >= 114000000 &&
      line2 >= 85000000 &&
      line3 >= 85000000 &&
      line4 >= 75000000 &&
      line5 >= 75000000
    ) {
      await CreateRewardHistory(
        userId,
        "Regional Manager",
        "1800CC CAR",
        4,
        line1,
        line2,
        line3,
        line4,
        line5
      );
    }

    console.log("level income");
  } catch (error) {
    console.error("Error in rewardIncome:", error);
    throw error;
  }
};

module.exports = rewardIncome;
