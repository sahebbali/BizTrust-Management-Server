const User = require("../models/auth.model");
const { PackageBuyInfo } = require("../models/topup.model");
const getIstTime = require("../config/getTime");
const generateString = require("../config/generateRandomString");
const Level = require("../models/level.model");
const { levelCommissionPerCentage } = require("../constants/topup.constants");
const { checkPackageLimit } = require("./checkPackageLimit");

const levelIncome = async (userId, roiPerDayCommissionAmount) => {
  console.log("hello");
  try {
    const levels = await Level.find({ "level.userId": userId });
    // console.log({ levels });
    for (const lvl of levels) {
      // find distributor level user level
      const distributorLvl = lvl?.level?.filter((d) => d?.userId === userId);
      // console.log("level", distributorLvl[0].level);
      const level = distributorLvl[0].level;
      const percentage = levelCommissionPerCentage[level];
      // console.log({ level });
      // console.log({ percentage });
      // find upline user
      const lvlUser = await User.findOne({ userId: lvl?.userId });
      const selfPackageInfo = await PackageBuyInfo.findOne({
        userId: lvlUser.userId,
        isActive: true,
      })
        .sort({ createdAt: -1 })
        .exec();
      console.log(selfPackageInfo?.packageAmount);
      if (selfPackageInfo) {
        const commissionAmount = (roiPerDayCommissionAmount / 100) * percentage;
        // update wallet
        console.log({ commissionAmount });
        console.log(lvlUser.userId);

        // Create level income history
        const packageInfo = await PackageBuyInfo.findOne({
          userId: distributorLvl[0]?.userId,
          isActive: true,
        })
          .sort({ createdAt: -1 })
          .exec();
        // console.log({ packageInfo });

        // console.log({ selfPackageInfo });
        await checkPackageLimit(
          selfPackageInfo,
          commissionAmount,
          packageInfo,
          level,
          "level-income",
          percentage
        );
      }
    }
  } catch (error) {
    console.log("Level Error", error);
  }
};

module.exports = levelIncome;
