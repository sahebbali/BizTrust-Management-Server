const User = require("../models/auth.model");
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
          eWallet: +CommissionAmount,
        },
      };
    } else if (type === "profit-sharing") {
      updateFields = {
        $inc: {
          profitSharingIncome: +CommissionAmount,
          totalIncome: +CommissionAmount,
          activeIncome: +CommissionAmount,
          profitWallet: +CommissionAmount,
        },
      };
    } else if (type === "roi-income") {
      updateFields = {
        $inc: {
          roiIncome: +CommissionAmount,
          totalIncome: +CommissionAmount,
          activeIncome: +CommissionAmount,
          profitWallet: +CommissionAmount,
        },
      };
    } else if (type === "reward-income") {
      updateFields = {
        $inc: {
          rewardIncome: +CommissionAmount,
          totalIncome: +CommissionAmount,
          activeIncome: +CommissionAmount,
          eWallet: +CommissionAmount,
        },
      };
    }

    await Wallet.findOneAndUpdate({ userId: userId }, updateFields, {
      new: true,
    });
    await User.findOneAndUpdate(
      { userId: userId },
      { $inc: { returnAmount: +CommissionAmount } },
      { new: true }
    );
  } catch (error) {
    console.log(error);
  }
};
const CheckUserEarningLimit = async (
  userId,
  userName,
  incomeFrom,
  incomeFromFullName,
  IncomeFromPackageAmount,
  amount,
  level,
  type,
  percentage
) => {
  try {
    const user = await User.findOne({ userId: userId });
    if (!user) {
      console.log(`User not found: ${userId}`);
      return;
    }

    const wallet = await Wallet.findOne({ userId: userId });
    if (!wallet) {
      console.log(`Wallet not found: ${userId}`);
      return;
    }

    if (user.returnAmount >= user.packageLimit) {
      console.log(`User ${userId} has reached their package limit`);
      await CreateExtraEarning(
        userId,
        userName,
        incomeFrom,
        incomeFromFullName,
        level,
        amount,
        type
      );
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
      await CreateExtraEarning(
        userId,
        userName,
        incomeFrom,
        incomeFromFullName,
        level,
        extraAmount,
        type
      );
      await CreateLevelIncomeHistory(
        userId,
        userName,
        incomeFrom,
        incomeFromFullName,
        IncomeFromPackageAmount,
        level,
        finalAmount,
        type,
        percentage
      );
      await UpdateWallet(userId, finalAmount, type);
    } else {
      console.log(`User ${userId} income within limit: ${amount}`);
      await CreateLevelIncomeHistory(
        userId,
        userName,
        incomeFrom,
        incomeFromFullName,
        IncomeFromPackageAmount,
        level,
        amount,
        type,
        percentage
      );
      await UpdateWallet(userId, amount, type);
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = { CheckUserEarningLimit, UpdateWallet };
