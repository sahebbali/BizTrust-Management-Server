const LevelIncome = require("../models/levelIncome.model");
const { PackageBuyInfo } = require("../models/topup.model");
const { UpdateWallet } = require("./CheckUserEarningLimit");

const CreateLevelIncomeHistory = require("./createLevelIncomeHistory");

const DistributionExtraEarning = async (userId, packageId, amount, type) => {
  try {
    console.log("distribution extra Earning");
    const updatePackage = await PackageBuyInfo.findOneAndUpdate(
      { packageId: packageId },
      {
        $inc: {
          totalReturnedAmount: +amount,
        },
      }
    );
    await UpdateWallet(userId, amount, type);
    if (type === "level-income") {
      const lastLevelIncome = await LevelIncome.findOne({ userId }).sort({
        createdAt: -1,
      });
      await CreateLevelIncomeHistory(
        lastLevelIncome.userId,
        lastLevelIncome.fullName,
        lastLevelIncome.selfPackageInfoAmount,
        lastLevelIncome.incomeFrom,
        lastLevelIncome.incomeFromFullName,
        lastLevelIncome.levelUserPackageInfoAmount,
        lastLevelIncome.level,
        amount,
        type
      );
    } else if (type === "profit-sharing") {
    } else if (type === "roi-income") {
    } else if (type === "reward-income") {
    }
  } catch (error) {
    console.log(error);
  }
};
module.exports = DistributionExtraEarning;
