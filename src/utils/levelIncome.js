const User = require("../models/auth.model");
const ManageLevelIncome = require("../models/manageLevelIncome");
const { CheckUserEarningLimit } = require("./CheckUserEarningLimit");

const levelIncome = async (fromUserId, fromFullName, packageAmount) => {
  console.log("Level Income Calculation Started");

  try {
    // 1️⃣ Load level commission config
    const levelCommissionMap = (
      await ManageLevelIncome.find({ type: "level-income" })
    ).reduce((acc, item) => {
      acc[item.level] = item.percentage;
      return acc;
    }, {});

    let currentUser = await User.findOne({ userId: fromUserId });
    if (!currentUser) return;

    let level = 1;
    const MAX_LEVEL = 5;
    // console.log({ levelCommissionMap });

    // 2️⃣ Traverse upline chain
    while (currentUser.sponsorId && level <= MAX_LEVEL) {
      // console.log({ level, currentUser });
      const uplineUser = await User.findOne({
        userId: currentUser.sponsorId,
        openLevel: { $gte: level }, // eligibility check
      }).select("userId fullName sponsorId sponsorName");

      if (!uplineUser) {
        // console.log("----------");
        currentUser = await User.findOne({
          userId: currentUser.sponsorId,
        }).select("userId fullName sponsorId sponsorName");
        level++;
        continue;
      }

      const percentage = levelCommissionMap[level] || 0;

      // console.log({ percentage });
      if (percentage <= 0) {
        console.log("No commission found for level:", level);
        currentUser = uplineUser;
        level++;
        continue;
      }

      const commissionAmount = Number(
        ((packageAmount * percentage) / 100).toFixed(2),
      );

      // console.log("---- Level Income Details ----");
      // console.log({
      //   level,
      //   uplineUser: uplineUser.userId,
      //   percentage,
      //   commissionAmount,
      // });

      // 3️⃣ Credit income
      await CheckUserEarningLimit(
        uplineUser.userId,
        uplineUser.fullName,
        fromUserId,
        fromFullName,
        packageAmount,
        commissionAmount,
        level,
        "level-income",
        percentage,
      );

      currentUser = uplineUser;
      level++;
    }
  } catch (error) {
    console.error("Error in levelIncome:", error);
  }
};

module.exports = levelIncome;
