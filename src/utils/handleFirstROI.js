const generateRandomString = require("../config/generateRandomId");
const getIstTime = require("../config/getTime");
const { PackageRoi, PackageBuyInfo } = require("../models/topup.model");
const profitSharingIncome = require("./profitSharingIncome");
const ManageROIHistory = require("../models/manageROI");
const { UpdateWallet } = require("./checkPackageLimit");
const { CheckUserPackageLimit } = require("./CheckUserPackageLimit");

const handleFirstROI = async () => {
  try {
    console.log("Starting First ROI Distribution");

    const currentISTTime = new Date(getIstTime().date);
    const today = currentISTTime.toDateString();
    const dateInt = currentISTTime.getTime();

    // console.log({ dateInt });

    const manageROi = await ManageROIHistory.find({ date: today });
    console.log({ manageROi });

    if (!manageROi || manageROi.percentage <= 0) {
      console.log("No valid commission percentage found, exiting.");
      return;
    }
    const secureROI = manageROi.find((item) => item.securityType === "secure");
    const insecureROI = manageROi.find(
      (item) => item.securityType === "insecure"
    );

    const securePercentage = secureROI ? secureROI.percentage : 0;
    const insecurePercentage = insecureROI ? insecureROI.percentage : 0;

    console.log("Secure Percentage:", securePercentage);
    console.log("Insecure Percentage:", insecurePercentage);
    const commissionPercentage = manageROi.percentage;
    console.log({ commissionPercentage });

    const activePackages = await PackageBuyInfo.find({
      isActive: true,
      isFirstROI: true,
      startDateInt: { $lte: dateInt },
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

        await CheckUserPackageLimit(pkg, securePercentage, insecurePercentage);
      })
    );

    console.log("ROI Distribution Completed Successfully.");
  } catch (error) {
    console.error("Error in handleROI:", error);
  }
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

module.exports = handleFirstROI;
