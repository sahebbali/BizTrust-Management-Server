const { PackageBuyInfo } = require("../models/topup.model");
const Wallet = require("../models/wallet.model");
const CreateExtraEarning = require("./createExtraEarning");
const CreateLevelIncomeHistory = require("./createLevelIncomeHistory");
const UpdateWallet = async (userId, CommissionAmount, type) => {
  try {
    // update wallet
    let updateFields = {};
    console.log({ type });
    if (type === "level-income") {
      console.log("level-income");
      updateFields = {
        $inc: {
          levelIncome: +CommissionAmount,
          totalIncome: +CommissionAmount,
          activeIncome: +CommissionAmount,
        },
      };
    } else if (type === "profit-sharing") {
      updateFields = {
        $inc: {
          profitSharingIncome: +CommissionAmount,
          totalIncome: +CommissionAmount,
          activeIncome: +CommissionAmount,
        },
      };
    } else if (type === "roi-income") {
      updateFields = {
        $inc: {
          roiIncome: +CommissionAmount,
          totalIncome: +CommissionAmount,
          activeIncome: +CommissionAmount,
        },
      };
    } else if (type === "reward-income") {
      updateFields = {
        $inc: {
          rewardIncome: +CommissionAmount,
          totalIncome: +CommissionAmount,
          activeIncome: +CommissionAmount,
        },
      };
    }

    const updatedWallet = await Wallet.findOneAndUpdate(
      { userId: userId },
      updateFields,
      { new: true }
    );
  } catch (error) {
    console.log(error);
  }
};
const checkPackageLimit = async (
  package,
  CommissionAmount,
  levelUserPackage,
  level,
  type,
  percentage
) => {
  console.log("-------------------------------------");
  //   console.log({ package, CommissionAmount });
  console.log("main amount", package.totalReturnedAmount + CommissionAmount);
  console.log("limit", package.packageLimit);

  if (package.totalReturnedAmount + CommissionAmount > package.packageLimit) {
    console.log("limit up");
    const totalAmount = package.totalReturnedAmount + CommissionAmount;
    const extraAmount = totalAmount - package.packageLimit;
    const pendingAmount = package.packageLimit - package.totalReturnedAmount;
    await UpdateWallet(package.userId, pendingAmount, type);

    if (type === "level-income") {
      await CreateLevelIncomeHistory(
        package.userId,
        package.userFullName,
        package.packageAmount,
        levelUserPackage.userId,
        levelUserPackage.userFullName,
        levelUserPackage.packageAmount,
        level,
        pendingAmount,
        type,
        percentage
      );
    } else if (type === "profit-sharing") {
      await CreateLevelIncomeHistory(
        package.userId,
        package.userFullName,
        package.packageAmount,
        levelUserPackage.userId,
        levelUserPackage.userFullName,
        levelUserPackage.packageAmount,
        level,
        pendingAmount,
        type,
        percentage
      );
    }

    await CreateExtraEarning(
      package.userId,
      package.userFullName,
      extraAmount,
      type
    );
    await PackageBuyInfo.findOneAndUpdate(
      { packageId: package.packageId },
      {
        $set: {
          isComplect: true,
          isActive: false,
        },
        $inc: {
          totalReturnedAmount: +pendingAmount,
        },
      }
    );
  } else {
    const updatePackage = await PackageBuyInfo.findOneAndUpdate(
      { packageId: package.packageId },
      {
        $inc: {
          totalReturnedAmount: +CommissionAmount,
        },
      }
    );
    await UpdateWallet(package.userId, CommissionAmount, type);
    if (type === "level-income") {
      await CreateLevelIncomeHistory(
        package.userId,
        package.userFullName,
        package.packageAmount,
        levelUserPackage.userId,
        levelUserPackage.userFullName,
        levelUserPackage.packageAmount,
        level,
        CommissionAmount,
        type,
        percentage
      );
    } else if (type === "profit-sharing") {
      await CreateLevelIncomeHistory(
        package.userId,
        package.userFullName,
        package.packageAmount,
        levelUserPackage.userId,
        levelUserPackage.userFullName,
        levelUserPackage.packageAmount,
        level,
        CommissionAmount,
        type,
        percentage
      );
    }
    if (updatePackage.totalReturnedAmount >= package.packageLimit) {
      await PackageBuyInfo.findOneAndUpdate(
        { packageId: package.packageId },
        {
          $set: {
            isComplect: true,
            isActive: false,
          },
        }
      );
    }
  }
  // await PackageRoi.create({
  //   userId,
  //   fullName,
  //   package: packageAmount,
  //   commissionPercentagePerDay: commissionPercentage,
  //   commissionAmount: Number(commissionPercentagePerDay).toFixed(3),
  //   // totalCommissionAmount: Number(
  //   //   ext?.totalReturnedAmount + roiPerDayCommissionAmount
  //   // ).toFixed(3),
  //   incomeDay: incomeDayInc,
  //   incomeDate: new Date(getIstTime().date).toDateString(),
  //   incomeTime: getIstTime().time,
  //   incomeDateInt: new Date(getIstTime().date).getTime(),
  //   transactionId: generateRandomString(),
  // });
};

module.exports = { checkPackageLimit, UpdateWallet };
