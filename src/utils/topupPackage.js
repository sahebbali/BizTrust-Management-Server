const getIstTime = require("../config/getTime");
const { getIstTimeWithInternet } = require("../config/internetTime");
const User = require("../models/auth.model");
const ExtraEarning = require("../models/extraEarning");
const { PackageBuyInfo, PackageRoi } = require("../models/topup.model");
const Wallet = require("../models/wallet.model");
const DistributionExtraEarning = require("./distrubutionExtraEarning");
const levelIncome = require("./levelIncome");

const topupPackageBuyInfoCreate = async (
  currentUser,
  packageAmount,
  startDate,
  isAdmin
) => {
  const extraEarning = await ExtraEarning.findOne({
    userId: currentUser.userId,
  });
  // Calculate the start and end dates
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(startDateObj);
  endDateObj.setFullYear(endDateObj.getFullYear() + 2); // Add 2 years to the start date

  const createPackage = await PackageBuyInfo.create({
    userId: currentUser.userId,
    userFullName: currentUser.fullName,
    sponsorId: currentUser.sponsorId,
    sponsorName: currentUser.sponsorName,
    packageId:
      Date.now().toString(36) + Math.random().toString(36).substring(2),
    packageAmount: packageAmount,
    packageLimit: packageAmount * 2,
    date: new Date(getIstTime().date).toDateString(),
    time: getIstTime().time,
    startDate: startDateObj.toDateString(), // Use the formatted start date
    startDateInt: startDateObj.getTime(), // Use timestamp for startDateInt
    endDate: endDateObj.toDateString(), // Use the formatted end date
    endDateInt: endDateObj.getTime(), // Use timestamp for endDateInt
    packageType: "Buy",
    isAdmin: isAdmin ? true : false,
  });
  if (extraEarning) {
    await DistributionExtraEarning(
      createPackage?.userId,
      createPackage.packageId,
      extraEarning?.amount,
      extraEarning?.type
    );
  }
};

const topupWalletUpdate = async (
  depositBalance,
  activeIncome,
  packageAmount,
  userId
) => {
  // First Deposit Amount then active amount
  depositBalance >= packageAmount
    ? await Wallet.findOneAndUpdate(
        { userId: userId },
        {
          $inc: {
            depositBalance: -packageAmount,
            investmentAmount: +packageAmount,
          },
        }
      )
    : await Wallet.findOneAndUpdate(
        { userId: userId },
        {
          $set: {
            depositBalance: 0,
            activeIncome: activeIncome - (packageAmount - depositBalance),
          },
          $inc: {
            investmentAmount: +packageAmount,
          },
        }
      );

  //     );
};

module.exports = {
  topupPackageBuyInfoCreate,
  topupWalletUpdate,
};
