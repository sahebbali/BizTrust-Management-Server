const generateString = require("../config/generateRandomString");
const getIstTime = require("../config/getTime");
const LevelIncome = require("../models/levelIncome.model");

const CreateLevelIncomeHistory = async (
  userId,
  fullName,
  selfPackageInfoAmount,
  incomeFrom,
  incomeFromFullName,
  levelUserPackageInfoAmount,
  level,
  commissionAmount,
  type,
  percentage
) => {
  try {
    await LevelIncome.create({
      userId: userId,
      fullName: fullName,
      incomeFrom: incomeFrom,
      incomeFromFullName: incomeFromFullName,
      level,
      amount: commissionAmount,
      date: new Date(getIstTime().date).toDateString(),
      time: getIstTime().time,
      type,
      levelUserPackageInfoAmount,
      selfPackageInfoAmount,
      transactionID: generateString(15),
      percentage
    });
  } catch (error) {
    console.log({ error });
  }
};

module.exports = CreateLevelIncomeHistory;
