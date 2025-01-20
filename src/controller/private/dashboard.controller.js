const User = require("../../models/auth.model");
const LastRoiData = require("../../models/lastRoiData");
const Wallet = require("../../models/wallet.model");
const checkPackageValidation = require("../../utils/checkPackageValidation");
const handleROI = require("../../utils/handleROI");
const levelIncome = require("../../utils/levelIncome");

const getAdminDashboardStatsController = async (_req, res) => {
  try {
    // Total Team and Direct Team count
    const alluser = await User.countDocuments({});
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    const blockedUsers = await User.countDocuments({ userStatus: false });
    const [investmentAmount] = await Wallet.aggregate([
      {
        $group: {
          _id: null,
          totalInvestmentAmount: {
            $sum: "$investmentAmount",
          },
        },
      },
    ]);

    const data = {
      alluser: alluser || 0,
      activeUsers: activeUsers || 0,
      inactiveUsers: inactiveUsers || 0,
      blockedUsers: blockedUsers || 0,
      totalInvestmentAmount: investmentAmount.totalInvestmentAmount,
    };
    if (data) {
      return res.status(200).json({ data });
    }
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};
const runROIStaticController = async (req, res) => {
  try {
    // await handleROI(),
    await checkPackageValidation();
    function getISTDate() {
      // Get current date and time in UTC
      const currentDate = new Date();

      // Create an Intl.DateTimeFormat object for Indian Standard Time (IST)
      const istOptions = {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      };
      const istFormatter = new Intl.DateTimeFormat("en-IN", istOptions);

      // Format the date in IST
      const istDateStr = istFormatter.format(currentDate);

      return istDateStr;
    }
    // Example usage
    const istDate = getISTDate();
    const lastUpdatedDate = await LastRoiData.findOne({});

    console.log({ dateX: lastUpdatedDate?.date });
    if (lastUpdatedDate?.date !== istDate) {
      await Promise.all([
        handleROI(), // ROI Income
        // levelIncome(), // Level Income
      ]);

      res.status(200).json({
        success: true,
        message: "ROI function has successfully run",
      });
    } else {
      res
        .status(400)
        .json({ success: false, message: `ROI is already run for ${istDate}` });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};
module.exports = {
  getAdminDashboardStatsController,
  runROIStaticController,
};
