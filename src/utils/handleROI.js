const ManageROIHistory = require("../models/manageROI");
const { PackageBuyInfo } = require("../models/topup.model");
const { CheckUserPackageLimit } = require("./CheckUserPackageLimit");
const { getCurrentPKT } = require("./getCurrentPKT");

const handleROI = async () => {
  try {
    console.log("Starting ROI Distribution");

    const { date: pktDate, time: pktTime, pktTimestamp } = getCurrentPKT();
    console.log(
      `Current PKT Date: ${pktDate}, Time: ${pktTime}, Timestamp: ${pktTimestamp}`,
    );

    const today = new Date(pktDate).toDateString().split(" ")[0];

    console.log({ today });
    const manageROi = await ManageROIHistory.find({
      date: new Date(pktDate).toDateString(),
    });

    if (today === "Sat" || today === "Sun") {
      console.log("ROI isn't distributed on Saturday and Sunday");
      return;
    }
    if (!manageROi) {
      console.log("No valid commission percentage found, exiting.");
      return;
    }
    const secureROI = manageROi.find(
      (item) => item.securityType === "Assets Fund",
    );
    const insecureROI = manageROi.find(
      (item) => item.securityType === "Equity Fund",
    );

    const securePercentage = secureROI ? secureROI.percentage : 0.13;
    const insecurePercentage = insecureROI ? insecureROI.percentage : 0.36;

    console.log("Secure Percentage:", securePercentage);
    console.log("Insecure Percentage:", insecurePercentage);

    const activePackages = await PackageBuyInfo.find({
      isActive: true,
      isFirstROI: false,
      isROIFree: false,
      isComplect: false,
      status: "success",
    });
    // console.log({ activePackages });
    console.log(`Total active packages: ${activePackages.length}`);

    if (activePackages.length === 0) {
      console.log("No eligible packages for ROI distribution.");
      return;
    }

    await Promise.all(
      activePackages.map(async (pkg) => {
        await CheckUserPackageLimit(pkg, securePercentage, insecurePercentage);
      }),
    );

    console.log("ROI Distribution Completed Successfully.");
  } catch (error) {
    console.error("Error in handleROI:", error);
  }
};

module.exports = handleROI;
