const User = require("../models/auth.model");
const { PackageBuyInfo } = require("../models/topup.model");

const { UpdateWallet } = require("./CheckUserEarningLimit");
const CreateExtraEarning = require("./createExtraEarning");
const CreateROIHistory = require("./CreateROIHistory");
const profitSharingIncome = require("./profitSharingIncome");

const CheckUserPackageLimit = async (
  package,
  securePercentage,
  insecurePercentage
) => {
  try {
    const user = await User.findOne({ userId: package.userId });
    if (!user) {
      console.log(`User not found: ${package.userId}`);
      return;
    }
    if (user.isPinAccount) {
      console.log(`User is Pin Account: ${package.userId}`);
      return;
    }
    const percentage = user.isSecureAccount
      ? securePercentage
      : insecurePercentage;
    const amount = (package.packageAmount * percentage) / 100;
    const userId = user.userId;
    const type = "roi-income";
    const fullName = user.fullName;
    // const incomeFrom = package.packageId;
    // const incomeFromFullName = package.packageName;
    // const IncomeFromPackageAmount = package.packageAmount;
    // const level = user.openLevel;
    // const type = "package-income";

    if (user.returnAmount >= user.packageLimit) {
      console.log(`User ${userId} has reached their package limit`);
      await CreateExtraEarning(userId, fullName, amount, type);

      return;
    }

    const totalIncome = user.returnAmount + amount;

    if (totalIncome > user.packageLimit) {
      const finalAmount = user.packageLimit - user.returnAmount;
      const extraAmount = totalIncome - user.packageLimit;

      await CreateExtraEarning(userId, fullName, extraAmount, type);
      const updatePackage = await PackageBuyInfo.findOneAndUpdate(
        { packageId: package.packageId },
        {
          $set: {
            isComplect: true,
            isActive: false,
          },
          $inc: {
            totalReturnedAmount: +finalAmount,
            incomeDay: +1,
          },
        },
        { new: true }
      );
      await CreateROIHistory(
        package.userId,
        package.userFullName,
        package.packageAmount,
        percentage,
        amount,
        updatePackage.incomeDay
      );
      await UpdateWallet(userId, finalAmount, type);
      await profitSharingIncome(
        package.userId,
        package.userFullName,
        finalAmount
      );
    } else {
      console.log(`User ${userId} income within limit: ${amount}`);
      const updatePackage = await PackageBuyInfo.findOneAndUpdate(
        { packageId: package.packageId },
        {
          $inc: {
            incomeDay: +1,
            totalReturnedAmount: +amount,
          },
          $set: {
            isFirstROI: false,
          },
        },
        { new: true }
      );

      // console.log({ updatePackage });

      await UpdateWallet(package.userId, amount, type);
      await CreateROIHistory(
        package.userId,
        package.userFullName,
        package.packageAmount,
        percentage,
        amount,
        updatePackage.incomeDay
      );

      await profitSharingIncome(package.userId, package.userFullName, amount);
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = { CheckUserPackageLimit };
