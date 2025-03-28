const getPSTime = require("../../config/getPSTime");
const User = require("../../models/auth.model");
const Kyc = require("../../models/KYCSchema");
const { PackageBuyInfo } = require("../../models/topup.model");
const Wallet = require("../../models/wallet.model");
const Withdraw = require("../../models/withdraw.model");
const checkPackageValidation = require("../../utils/checkPackageValidation");
const handleROI = require("../../utils/handleROI");
const levelIncome = require("../../utils/levelIncome");

const getAdminDashboardStatsController = async (_req, res) => {
  try {
    const { date } = getPSTime();
    const today = new Date(date).toDateString();

    console.log({ today });
    // Fetch user counts concurrently
    const [allUsers, activeUsers, inactiveUsers, blockedUsers, allKyc] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ isActive: false }),
        User.countDocuments({ userStatus: false }),
        Kyc.countDocuments({}),
      ]);

    // Fetch aggregated values concurrently
    const [
      investmentData,
      packageData,
      pendingWithdrawData,
      approvedWithdrawData,
      totalWithdrawData,
      todayPackageData,
      todayUserCount,
      totalPackageData,
      totalUserData,
    ] = await Promise.all([
      Wallet.aggregate([
        {
          $group: {
            _id: null,
            totalInvestmentAmount: { $sum: "$investmentAmount" },
          },
        },
      ]),
      PackageBuyInfo.aggregate([
        { $match: {} },
        {
          $group: { _id: null, totalPackageAmount: { $sum: "$packageAmount" } },
        },
      ]),
      Withdraw.aggregate([
        { $match: { status: "pending" } },
        { $group: { _id: null, totalAmount: { $sum: "$requestAmount" } } },
      ]),
      Withdraw.aggregate([
        { $match: { status: "success" } },
        { $group: { _id: null, totalAmount: { $sum: "$requestAmount" } } },
      ]),
      Withdraw.aggregate([
        { $group: { _id: null, totalAmount: { $sum: "$requestAmount" } } },
      ]),
      PackageBuyInfo.aggregate([
        { $match: { date: today } },
        {
          $group: { _id: null, totalPackageAmount: { $sum: "$packageAmount" } },
        },
      ]),
      PackageBuyInfo.aggregate([
        { $match: { date: today } },
        { $group: { _id: "$userId" } }, // Group by unique userId
        { $count: "uniqueUsers" }, // Count unique users
      ]),
      PackageBuyInfo.aggregate([
        {
          $group: { _id: null, totalPackageAmount: { $sum: "$packageAmount" } },
        }, // Total package amount for all time
      ]),
      PackageBuyInfo.aggregate([
        { $group: { _id: "$userId" } }, // Unique users for all time
        { $count: "uniqueUsers" },
      ]),
    ]);

    // Extract values safely
    const totalInvestmentAmount = investmentData[0]?.totalInvestmentAmount || 0;
    const totalPackageAmount = packageData[0]?.totalPackageAmount || 0;
    const totalPendingWithdraw = pendingWithdrawData[0]?.totalAmount || 0;
    const totalApprovedWithdraw = approvedWithdrawData[0]?.totalAmount || 0;
    const totalWithdraw = totalWithdrawData[0]?.totalAmount || 0;

    const todayTotalPackageAmount =
      todayPackageData[0]?.totalPackageAmount || 0;
    const todayPackageUserCount = todayUserCount[0]?.uniqueUsers || 0;
    const totalAllTimePackageAmount =
      totalPackageData[0]?.totalPackageAmount || 0;
    const totalAllTimeUserCount = totalUserData[0]?.uniqueUsers || 0;
    // Response data
    return res.status(200).json({
      data: {
        allUsers,
        activeUsers,
        inactiveUsers,
        blockedUsers,
        allKyc,
        totalInvestmentAmount,
        totalPackageAmount,
        totalPendingWithdraw,
        totalApprovedWithdraw,
        totalWithdraw,

        todayTotalPackageAmount,
        todayPackageUserCount,
        totalAllTimePackageAmount,
        totalAllTimeUserCount,
      },
    });
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    return res.status(500).json({ message: "Internal server error" });
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
