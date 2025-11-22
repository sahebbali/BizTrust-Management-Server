const generateRandomString = require("../config/generateRandomId");
const getIstTime = require("../config/getTime");
const { PackageRoi, PackageBuyInfo } = require("../models/topup.model");

const ManageROIHistory = require("../models/manageROI");

const { CheckUserPackageLimit } = require("./CheckUserPackageLimit");

const handleFirstROI = async () => {
  try {
    console.log("Starting First ROI Distribution");

    const currentISTTime = new Date(getIstTime().date);
    const todays = currentISTTime.toDateString();
    const dateInt = currentISTTime.getTime();
    const today = new Date(getIstTime().date).toDateString().split(" ")[0];

    // console.log({ dateInt });
    console.log({ todays });
    console.log({ today });

    const manageROi = await ManageROIHistory.find({ date: todays });
    // console.log({ manageROi });

    if (today === "Sat" || today === "Sun") {
      console.log("ROI isn't distributed on Saturday and Sunday");
      return;
    }

    if (!manageROi) {
      console.log("No valid commission percentage found, exiting.");
      return;
    }
    const secureROI = manageROi.find((item) => item.securityType === "secure");
    const insecureROI = manageROi.find(
      (item) => item.securityType === "insecure"
    );

    const securePercentage = secureROI ? secureROI.percentage : 0.13;
    const insecurePercentage = insecureROI ? insecureROI.percentage : 0.36;

    console.log("Secure Percentage:", securePercentage);
    console.log("Insecure Percentage:", insecurePercentage);

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
        await CheckUserPackageLimit(pkg, securePercentage, insecurePercentage);
      })
    );

    console.log("ROI Distribution Completed Successfully.");
  } catch (error) {
    console.error("Error in handleROI:", error);
  }
};

module.exports = handleFirstROI;
