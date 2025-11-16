const getIstTime = require("../config/getTime");

const { PackageBuyInfo } = require("../models/topup.model");
const ManageROIHistory = require("../models/manageROI");

const { CheckUserPackageLimit } = require("./CheckUserPackageLimit");

const handleROI = async () => {
  try {
    console.log("Starting ROI Distribution");

    const currentISTTime = new Date(getIstTime().date);
    const today = currentISTTime.toDateString();
    const dateInt = currentISTTime.getTime();

    // console.log({ dateInt });

    const manageROi = await ManageROIHistory.find({ date: today });

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
        await CheckUserPackageLimit(pkg, securePercentage, insecurePercentage);
      })
    );

    console.log("ROI Distribution Completed Successfully.");
  } catch (error) {
    console.error("Error in handleROI:", error);
  }
};

module.exports = handleROI;
