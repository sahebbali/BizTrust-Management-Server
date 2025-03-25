const Level = require("../../models/level.model");
const LevelIncome = require("../../models/levelIncome.model");
const { PackageRoi, PackageBuyInfo } = require("../../models/topup.model");
const Wallet = require("../../models/wallet.model");

const getDashboardStatsController = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0); // Start of the day
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999); // End of the day
const today = new Date().toDateString()
console.log({today})
    // Total Team and Direct Team count
    const team = await Level.findOne({ userId: req.auth.id });
    const totalTeam = team?.level?.length;
    const totalDirectTeam = team?.level?.filter((l) => l.level === "1").length;
    const walletFind = await Wallet.findOne({ userId: req.auth.id });
    // ROI Income
    const roiIncome = await PackageRoi.findOne({ userId: req.auth.id });
    const todayLevelIncome = await LevelIncome.aggregate([
      {
        $match: {
          userId: req.auth.id,
          type: "level-income",
          createdAt: { $gte: startOfToday, $lt: endOfToday },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          count: { $ifNull: ["$count", 0] },
          totalAmount: { $ifNull: ["$totalAmount", 0] },
        },
      },
    ]);
    console.log({ todayLevelIncome });
    const data = {
      totalTeam,
      totalDirectTeam,
      levelIncome: walletFind?.levelIncome,
      roiIncome: walletFind?.roiIncome,
    };
    if (data) {
      return res.status(200).json({ data });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Something went wrong" });
  }
};
const geTodayController = async (req, res) => {
  try {
    // Total Team and Direct Team count
    const team = await Level.findOne({ userId: req.auth.id });
    const totalTeam = team?.level?.length;
    const totalDirectTeam = team?.level?.filter((l) => l.level === "1").length;
    const walletFind = await Wallet.findOne({ userId: req.auth.id });
    // ROI Income
    const roiIncome = await PackageRoi.findOne({ userId: req.auth.id });
    // ROI Table
    const roiHistory = roiIncome?.history;
    // Topup history
    const topupHistory = await PackageBuyInfo.find({ userId: req.auth.id });
    const data = {
      totalTeam,
      totalDirectTeam,
      levelIncome: walletFind?.levelIncome,
      roiIncome: walletFind?.roiIncome,
      roiHistory,
      topupHistory,
    };
    if (data) {
      return res.status(200).json({ data });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Something went wrong" });
  }
};

module.exports = { getDashboardStatsController };
