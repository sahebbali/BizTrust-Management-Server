const generateRandomString = require("../config/generateRandomId");
const getIstTime = require("../config/getTime");
const {
  forbiddenDates,
  roiCommissionPercentage,
} = require("../constants/topup.constants");
const { PackageRoi, PackageBuyInfo } = require("../models/topup.model");
const Wallet = require("../models/wallet.model");
const LastRoiData = require("../models/lastRoiData");

const handleROI = async () => {
  try {
    console.log("hello Run");
    {
      const today = new Date(getIstTime().date).toDateString().split(" ")[0];
      const dateInt = new Date(getIstTime().date).getTime();
      console.log({ dateInt });
      const commissionPercentage = 2;
      // if (today === "Sat" || today === "Sun") {
      //   console.log("ROI isn't distributed on Saturday and Sunday");
      //   return res
      //     .status(400)
      //     .json({ message: "ROI isn't distributed on Saturday and Sunday" });
      // }
      const existPackage = await PackageBuyInfo.find({ isActive: true }).select(
        "-history"
      );

      for (package of existPackage) {
        const packageAmount = package.packageAmount;
        const commissionAmount = (packageAmount * commissionPercentage) / 100;
        console.log({ commissionAmount });
        await checkPackageLimit(
          package,
          commissionAmount,
          commissionPercentage
        );
      }
      console.log("Distribute ROI");
    }
  } catch (error) {
    console.log(error);
  }
};

const checkPackageLimit = async (
  package,
  CommissionAmount,
  commissionPercentage
) => {
  if (package.totalReturnedAmount + CommissionAmount > package.packageLimit) {
  } else {
    const updatePackage = await PackageBuyInfo.findOneAndUpdate(
      { packageId: package.packageId },
      {
        $inc: {
          incomeDay: +1,
          totalReturnedAmount: +CommissionAmount,
        },
      }
    );

    console.log({ updatePackage });
    await Wallet.findOneAndUpdate(
      { userId: package.userId },
      {
        $inc: {
          roiIncome: +CommissionAmount,
          totalIncome: +CommissionAmount,
          activeIncome: +CommissionAmount,
        },
      },
      { new: true }
    );

    await createROIHistory(
      package.userId,
      package.userFullName,
      package.packageAmount,
      commissionPercentage,
      CommissionAmount,
      updatePackage.incomeDay
    );

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
const createROIHistory = async (
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
const mainFuncOfROI = async (ext, prevPackAmount) => {
  if (ext.isActive) {
    // const prevPackAmount = packAmount;
    const incomeDayInc = ext.incomeDay + 1;
    const roiPerDayCommissionAmount =
      prevPackAmount <= 500
        ? (prevPackAmount / 100) * roiCommissionPercentage.thirtyTo5Hundred
        : prevPackAmount >= 700 && prevPackAmount <= 3500
        ? (prevPackAmount / 100) * roiCommissionPercentage.sevenHundredTo3k
        : (prevPackAmount / 100) * roiCommissionPercentage.fiveKToN;
    const roiPerDayCommissionPercentage =
      prevPackAmount <= 500
        ? roiCommissionPercentage.thirtyTo5Hundred
        : prevPackAmount >= 700 && prevPackAmount <= 3500
        ? roiCommissionPercentage.sevenHundredTo3k
        : roiCommissionPercentage.fiveKToN;

    await Wallet.findOneAndUpdate(
      { userId: ext.userId },
      {
        $inc: {
          roiIncome: +roiPerDayCommissionAmount,
          totalIncome: +roiPerDayCommissionAmount,
          activeIncome: +roiPerDayCommissionAmount,
        },
      },
      { new: true }
    );

    await PackageRoi.findOneAndUpdate(
      { packageId: ext.packageId },
      {
        $inc: {
          incomeDay: +1,
          totalReturnedAmount: +roiPerDayCommissionAmount,
        },
        $set: {
          isMondayCheck: true,
        },
        $push: {
          history: {
            userId: ext.userId,
            fullName: ext.fullName,
            package: prevPackAmount,
            commissionPercentagePerDay: roiPerDayCommissionPercentage,
            commissionAmount: Number(roiPerDayCommissionAmount).toFixed(3),
            totalCommissionAmount: Number(
              ext?.totalReturnedAmount + roiPerDayCommissionAmount
            ).toFixed(3),
            incomeDay: incomeDayInc,
            incomeDate: new Date(getIstTime().date).toDateString(),
            incomeTime: getIstTime().time,
            incomeDateInt: new Date(getIstTime().date).getTime(),
            transactionId: generateRandomString(),
          },
        },
      }
    );
  }
};

module.exports = handleROI;
