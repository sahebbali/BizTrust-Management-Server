const Level = require("../../models/level.model");
const LevelIncome = require("../../models/levelIncome.model");
const { PackageRoi, PackageBuyInfo } = require("../../models/topup.model");
const Wallet = require("../../models/wallet.model");
const getPSTime = require("../../config/getPSTime");
const RewardIncomeModel = require("../../models/rewardIncome.model");
const getDashboardStatsController = async (req, res) => {
  try {
    const userId = req.auth.id;
    const { date } = getPSTime();

    const today = new Date(date).toDateString();
    console.log({ today });
    // Total Team and Direct Team count
    const team = await Level.findOne({ userId });
    const packageInfo = await PackageBuyInfo.find({
      userId,
      status: "success",
    });
    const totalTeam = team?.level?.length;
    const totalDirectTeam = team?.level?.filter((l) => l.level === "1").length;
    const walletFind = await Wallet.findOne({ userId });

    const todayLevelIncome = await LevelIncome.aggregate([
      {
        $match: {
          userId,
          type: "level-income",
          date: today,
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
          totalAmount: 1,
        },
      },
    ]);
    const todayROiIncome = await PackageRoi.aggregate([
      {
        $match: {
          userId,
          incomeDate: today,
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAmount: { $sum: "$commissionAmount" },
        },
      },
      {
        $project: {
          _id: 0,
          totalAmount: 1,
        },
      },
    ]);
    const todayProfitSharingIncome = await LevelIncome.aggregate([
      {
        $match: {
          userId,
          type: "profit-sharing",
          date: today,
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
          totalAmount: 1,
        },
      },
    ]);
    const todayRewardIncome = await RewardIncomeModel.aggregate([
      {
        $match: {
          userId,
          date: today,
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAmount: { $sum: "$rewardAmount" },
        },
      },
      {
        $project: {
          _id: 0,
          totalAmount: 1,
        },
      },
    ]);
    // Ensure default values if no data is found
    const levelIncome = walletFind?.levelIncome || 0;
    const roiIncome = walletFind?.roiIncome || 0;
    const rewardIncome = walletFind?.rewardIncome || 0;
    const profitSharingIncome = walletFind?.profitSharingIncome || 0;

    const totalIncome =
      levelIncome + roiIncome + rewardIncome + profitSharingIncome;

    // Calculate percentages
    const levelIncomePercentage = totalIncome
      ? ((levelIncome / totalIncome) * 100).toFixed(2)
      : 0;
    const roiIncomePercentage = totalIncome
      ? ((roiIncome / totalIncome) * 100).toFixed(2)
      : 0;
    const rewardIncomePercentage = totalIncome
      ? ((rewardIncome / totalIncome) * 100).toFixed(2)
      : 0;
    const profitSharingIncomePercentage = totalIncome
      ? ((profitSharingIncome / totalIncome) * 100).toFixed(2)
      : 0;
    // Ensure default values if no data is found

    console.log({ walletFind });
    const data = {
      totalTeam,
      totalDirectTeam,
      levelIncome: walletFind?.levelIncome,
      roiIncome: walletFind?.roiIncome,
      rewardIncome: walletFind?.rewardIncome,
      profitSharingIncome: walletFind?.profitSharingIncome,
      depositBalance: walletFind?.depositBalance,
      profitWallet: walletFind?.profitWallet,
      eWallet: walletFind?.eWallet,
      todayLevelIncome: todayLevelIncome[0]?.totalAmount || 0,
      todayProfitSharingIncome: todayProfitSharingIncome[0]?.totalAmount || 0,
      todayROiIncome: todayROiIncome[0]?.totalAmount || 0,
      todayRewardIncome: todayRewardIncome[0]?.totalAmount || 0,
      profitSharingIncomePercentage,
      rewardIncomePercentage,
      roiIncomePercentage,
      levelIncomePercentage,
      packageInfo,
    };
    // console.log({ data });
    if (data) {
      return res.status(200).json({ data });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Something went wrong" });
  }
};

module.exports = { getDashboardStatsController };
