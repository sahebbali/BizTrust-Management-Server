const generateRandomString = require("../config/generateRandomId");
const getIstTime = require("../config/getTime");

const { PackageRoi, PackageBuyInfo } = require("../models/topup.model");
const profitSharingIncome = require("./profitSharingIncome");
const ManageROIHistory = require("../models/manageROI");
const { UpdateWallet } = require("./checkPackageLimit");

const handleROI = async () => {
  try {
    console.log("Starting ROI Distribution");

    const currentISTTime = new Date(getIstTime().date);
    const today = currentISTTime.toDateString();
    const dateInt = currentISTTime.getTime();

    // console.log({ dateInt });

    const manageROi = await ManageROIHistory.findOne({ date: today });

    if (!manageROi || manageROi.percentage <= 0) {
      console.log("No valid commission percentage found, exiting.");
      return;
    }

    const commissionPercentage = manageROi.percentage;
    console.log({ commissionPercentage });

    const activePackages = await PackageBuyInfo.find({
      isActive: true,
      isFirstROI: false,
      isROIFree: false,
      status: "success",
    });
    console.log({ activePackages });
    console.log(`Total active packages: ${activePackages.length}`);

    if (activePackages.length === 0) {
      console.log("No eligible packages for ROI distribution.");
      return;
    }

    await Promise.all(
      activePackages.map(async (pkg) => {
        const commissionAmount =
          (pkg.packageAmount * commissionPercentage) / 100;
        console.log({ packageId: pkg._id, commissionAmount });

        await checkPackageLimit(pkg, commissionAmount, commissionPercentage);
      })
    );

    console.log("ROI Distribution Completed Successfully.");
  } catch (error) {
    console.error("Error in handleROI:", error);
  }
};

const checkPackageLimit = async (
  package,
  CommissionAmount,
  commissionPercentage
) => {
  const type = "roi-income";
  if (package.totalReturnedAmount + CommissionAmount > package.packageLimit) {
    console.log("limit up");
    const totalAmount = package.totalReturnedAmount + CommissionAmount;
    const extraAmount = totalAmount - package.packageLimit;
    const pendingAmount = package.packageLimit - package.totalReturnedAmount;

    await UpdateWallet(package.userId, pendingAmount, type);
    await profitSharingIncome(
      package.userId,
      package.userFullName,
      pendingAmount
    );

    await createROIHistory(
      package.userId,
      package.userFullName,
      package.packageAmount,
      commissionPercentage,
      pendingAmount,
      updatePackage.incomeDay
    );
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
          incomeDay: +1,
          totalReturnedAmount: +pendingAmount,
        },
      }
    );
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
    const incomeDay = updatePackage.incomeDay;
    console.log({ incomeDay });
    await UpdateWallet(package.userId, CommissionAmount, type);
    await createROIHistory(
      package.userId,
      package.userFullName,
      package.packageAmount,
      commissionPercentage,
      CommissionAmount,
      incomeDay
    );

    await profitSharingIncome(
      package.userId,
      package.userFullName,
      CommissionAmount
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

module.exports = handleROI;
