const User = require("../../models/auth.model");
const { PackageBuyInfo } = require("../../models/topup.model");
const Wallet = require("../../models/wallet.model");
const Withdraw = require("../../models/withdraw.model");
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
    const queryFilter = {
      userId: req.auth.id,
      isActive: true,
    };
    const withdrawPendingQueryFilter = {
      status: "pending",
    };
    const withdrawApprovedQueryFilter = {
      status: "success",
    };

    // Use aggregation to calculate the sum of packageAmount
    const result = await PackageBuyInfo.aggregate([
      { $match: queryFilter }, // Filter documents based on the query
      {
        $group: {
          _id: null, // Group all documents together
          totalPackageAmount: { $sum: "$packageAmount" }, // Sum the packageAmount field
        },
      },
    ]);
    // Use aggregation to calculate the sum of packageAmount
    const pendingWithdraw = await Withdraw.aggregate([
      { $match: withdrawPendingQueryFilter }, // Filter documents based on the query
      {
        $group: {
          _id: null, // Group all documents together
          totalAmount: { $sum: "$requestAmount" }, // Sum the packageAmount field
        },
      },
    ]);
    const approveWithdraw = await Withdraw.aggregate([
      { $match: withdrawApprovedQueryFilter }, // Filter documents based on the query
      {
        $group: {
          _id: null, // Group all documents together
          totalAmount: { $sum: "$requestAmount" }, // Sum the packageAmount field
        },
      },
    ]);
    const totalWithdraw = await Withdraw.aggregate([
      // { $match: withdrawApprovedQueryFilter }, // Filter documents based on the query
      {
        $group: {
          _id: null, // Group all documents together
          totalAmount: { $sum: "$requestAmount" }, // Sum the packageAmount field
        },
      },
    ]);
    const data = {
      alluser: alluser || 0,
      activeUsers: activeUsers || 0,
      inactiveUsers: inactiveUsers || 0,
      blockedUsers: blockedUsers || 0,
      totalInvestmentAmount: investmentAmount.totalInvestmentAmount,
      totalPackageAmount: result[0].totalPackageAmount,
      totalPendingWithdraw: pendingWithdraw[0].totalAmount,
      totalApprovedWithdraw: approveWithdraw[0].totalAmount,
      totalWithdraw: totalWithdraw[0].totalAmount,
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
