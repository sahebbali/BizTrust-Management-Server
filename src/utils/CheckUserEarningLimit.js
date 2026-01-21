const User = require("../models/auth.model");
const Wallet = require("../models/wallet.model");
const CreateExtraEarning = require("./createExtraEarning");
const CreateLevelIncomeHistory = require("./createLevelIncomeHistory");
const UpdateWallet = async (userId, CommissionAmount, type, level) => {
  try {
    console.log({ userId, CommissionAmount, type, level });
    const isDirectLevel = level === 1;
    console.log({ isDirectLevel });
    let updateFields = {};
    console.log({ type });
    if (type === "level-income") {
      console.log("level-income");
      updateFields = {
        $inc: {
          // [isDirectLevel ? "directIncome" : "levelIncome"]: +CommissionAmount,
          directIncome: level === 1 ? CommissionAmount : 0,
          levelIncome: level === 1 ? 0 : CommissionAmount,
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
      { new: true },
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
  percentage,
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

    if (
      user.returnAmount >= user.packageLimit &&
      user.packageAmount !== 0 &&
      !user.isPinAccount
    ) {
      console.log(`User ${userId} has reached their package limit`);
      await CreateExtraEarning(
        userId,
        userName,
        incomeFrom,
        incomeFromFullName,
        level,
        amount,
        type,
      );
      return;
    }

    const totalIncome = user.returnAmount + amount;

    if (
      totalIncome > user.packageLimit &&
      user.packageLimit > 0 &&
      !user.isPinAccount
    ) {
      const finalAmount = user.packageLimit - user.returnAmount;
      const extraAmount = totalIncome - user.packageLimit;
      console.log(
        `Adjusting amount for user ${userId} to ${finalAmount} due to package limit`,
      );
      await CreateExtraEarning(
        userId,
        userName,
        incomeFrom,
        incomeFromFullName,
        level,
        extraAmount,
        type,
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
        percentage,
      );
      await UpdateWallet(userId, finalAmount, type, level);
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
        percentage,
      );
      await UpdateWallet(userId, amount, type, level);
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = { CheckUserEarningLimit, UpdateWallet };
