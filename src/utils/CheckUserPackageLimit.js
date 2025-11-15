const User = require("../models/auth.model");
const { PackageBuyInfo } = require("../models/topup.model");

const { UpdateWallet } = require("./CheckUserEarningLimit");
const CreateExtraEarning = require("./createExtraEarning");
const CreateROIHistory = require("./CreateROIHistory");

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
    const percentage = user.isSecure ? securePercentage : insecurePercentage;
    const amount = (package.packageAmount * percentage) / 100;
    // const userId = user.userId;
    // const userName = user.userName;
    // const incomeFrom = package.packageId;
    // const incomeFromFullName = package.packageName;
    // const IncomeFromPackageAmount = package.packageAmount;
    // const level = user.openLevel;
    // const type = "package-income";

    if (user.returnAmount >= user.packageLimit) {
      console.log(`User ${userId} has reached their package limit`);
      await CreateExtraEarning(user.userId, user.userName, amount, type);

      return;
    }
    2400;
    const totalIncome = user.returnAmount + amount;

    if (totalIncome > user.packageLimit) {
      const finalAmount = user.packageLimit - user.returnAmount;
      const extraAmount = totalIncome - user.packageLimit;
      console.log(
        `Adjusting amount for user ${userId} to ${finalAmount} due to package limit`
      );
      await CreateExtraEarning(userId, userName, extraAmount, type);
      await PackageBuyInfo.findOneAndUpdate(
        { packageId: package.packageId },
        {
          $set: {
            isComplect: true,
            isActive: false,
          },
          $inc: {
            totalReturnedAmount: +finalAmount,
          },
        }
      );

      await UpdateWallet(userId, finalAmount, type);
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
        }
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
