const getPSTime = require("../config/getPSTime");
const { PackageBuyInfo } = require("../models/topup.model");

const checkPackageValidation = async () => {
  try {
    // Get the current PST date and time
    const { date } = getPSTime();
    const dateInt = new Date(date).getTime();

    console.log("Current Date (PST) as Timestamp:", dateInt);

    // Find all active packages with endDateInt less than or equal to the current timestamp
    const activePackages = await PackageBuyInfo.find({
      isActive: true,
      endDateInt: { $lte: dateInt },
    });

    if (activePackages.length === 0) {
      console.log("No packages to update.");
      return;
    }

    // Update each expired package
    const updatePromises = activePackages.map((pkg) =>
      PackageBuyInfo.findOneAndUpdate(
        { packageId: pkg.packageId },
        {
          $set: {
            isActive: false,
            isExpired: true,
          },
        }
      )
    );

    await Promise.all(updatePromises);

    console.log(`Updated ${activePackages.length} packages as expired.`);
  } catch (error) {
    console.error("Error in checkPackageValidation:", error);
  }
};

module.exports = checkPackageValidation;
