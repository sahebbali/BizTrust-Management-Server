const generateRandomString = require("../config/generateRandomId");
const getIstTime = require("../config/getTime");
const { PackageRoi } = require("../models/topup.model");

const CreateROIHistory = async (
  userId,
  fullName,
  packageAmount,
  commissionPercentage,
  commissionAmount,
  incomeDay
) => {
  console.log("crate ROI");
  console.log({
    userId,
    fullName,
    packageAmount,
    commissionPercentage,
    commissionAmount,
    incomeDay,
  });
  await PackageRoi.create({
    userId,
    fullName,
    package: packageAmount,
    commissionPercentage: commissionPercentage,
    commissionAmount: Number(commissionAmount).toFixed(3),
    // totalCommissionAmount: Number(
    //   ext?.totalReturnedAmount + roiPerDayCommissionAmount
    // ).toFixed(3),
    incomeDay,
    incomeDate: new Date(getIstTime().date).toDateString(),
    incomeTime: getIstTime().time,
    incomeDateInt: new Date(getIstTime().date).getTime(),
    transactionId: generateRandomString(),
  });
};

module.exports = CreateROIHistory;
