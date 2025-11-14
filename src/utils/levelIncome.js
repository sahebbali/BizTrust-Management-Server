const User = require("../models/auth.model");
const { PackageBuyInfo } = require("../models/topup.model");
const { checkPackageLimit } = require("./checkPackageLimit");
const Level = require("../models/level.model");
const ManageLevelIncome = require("../models/manageLevelIncome");

const levelIncome = async (userId, roiPerDayCommissionAmount) => {
  console.log("Level Income Calculation Started");

  try {
    // Fetch user levels
    const userLevels = await Level.find({ "level.userId": userId });

    // Fetch level commission percentages and map them for quick lookup
    const levelCommissionMap = (
      await ManageLevelIncome.find({ type: "level-income" })
    ).reduce((acc, item) => ({ ...acc, [item.level]: item.percentage }), {});

    console.log("User Levels:", userLevels);

    for (const levelData of userLevels) {
      // Extract distributor's level
      const distributorLevelData = levelData.level.find(
        (d) => d.userId === userId
      );
      if (!distributorLevelData) continue;

      const level = parseInt(distributorLevelData.level, 10);
      const percentage = levelCommissionMap[level] || 0;

      console.log({ level, percentage });

      // Find the upline user (who is at or above the current level)
      const uplineUser = await User.findOne({
        userId: levelData.userId,
        openLevel: { $gte: level },
      }).select("sponsorName sponsorId fullName userId openLevel");

      console.log("Upline User:", uplineUser);

      if (!uplineUser) {
        console.log(`No eligible upline user for level ${level}`);
        continue;
      }

      // Find the upline's active package info
      const selfPackageInfo = await PackageBuyInfo.findOne({
        userId: uplineUser.userId,
        isActive: true,
      }).sort({ createdAt: -1 });

      if (!selfPackageInfo) {
        console.log(`No active package found for ${uplineUser.userId}`);
        continue;
      }

      // Calculate commission
      const commissionAmount = (roiPerDayCommissionAmount * percentage) / 100;
      console.log("Commission:", commissionAmount, "User:", uplineUser.userId);

      // Fetch distributor's active package
      const distributorPackage = await PackageBuyInfo.findOne({
        userId: distributorLevelData.userId,
        isActive: true,
      }).sort({ createdAt: -1 });

      // Check package limits and process level income
      // await checkPackageLimit(
      //   selfPackageInfo,
      //   commissionAmount,
      //   distributorPackage,
      //   level,
      //   "level-income",
      //   percentage
      // );
    }
  } catch (error) {
    console.error("Error in levelIncome:", error);
  }
};

module.exports = levelIncome;
