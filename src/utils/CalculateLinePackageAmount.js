const User = require("../models/auth.model");
const Level = require("../models/level.model");
const Wallet = require("../models/wallet.model");

const CalculateLinePackageAmount = async (userId) => {
  console.log("▶ CalculateLinePackageAmount Called for:", userId);

  try {
    // Find the level document for the user
    const levels = await Level.findOne({ userId }).lean();

    // Get all level user IDs + self userId
    const distributorLevels = levels?.level || [];
    const userIds = distributorLevels
      .filter((item) => item?.userId)
      .map((item) => item.userId);

    userIds.push(userId); // Include the main user
    // console.log("User IDs in line:", userIds);

    // --- Fetch Investment Sum & Total Users in Line ---
    const [investmentData] = await Wallet.aggregate([
      { $match: { userId: { $in: userIds } } },
      {
        $group: {
          _id: null,
          totalInvestmentAmount: { $sum: "$investmentAmount" },
          totalUsers: { $sum: 1 },
        },
      },
    ]);

    // --- Fetch Rank Counts in a Single Query ---
    const rankCounts = await User.aggregate([
      {
        $match: {
          userId: { $in: userIds },
          rank: {
            $in: [
              "Sales Manager",
              "Team Manager",
              "Area Sales Manager",
              "Sales Director",
            ],
          },
        },
      },
      {
        $group: {
          _id: "$rank",
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert aggregated ranks to readable format
    const ranks = {
      SalesManager: 0,
      TeamManager: 0,
      AreaSalesManager: 0,
      SalesDirector: 0,
    };

    rankCounts.forEach((item) => {
      if (item._id === "Sales Manager") ranks.SalesManager = item.count;
      if (item._id === "Team Manager") ranks.TeamManager = item.count;
      if (item._id === "Area Sales Manager")
        ranks.AreaSalesManager = item.count;
      if (item._id === "Sales Director") ranks.SalesDirector = item.count;
    });

    const result = {
      totalInvestmentAmount: investmentData?.totalInvestmentAmount || 0,
      userCount: investmentData?.totalUsers || 0,
      ...ranks,
    };

    // console.log("✔ Result:", result);
    return result;
  } catch (error) {
    console.error("❌ CalculateLinePackageAmount Error:", error.message);
    throw error;
  }
};

module.exports = CalculateLinePackageAmount;
