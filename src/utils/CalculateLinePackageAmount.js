const Level = require("../models/level.model");
const Wallet = require("../models/wallet.model");

const CalculateLinePackageAmount = async (userId) => {
  console.log("CalculateLinePackageAmount");
  try {
    // Find the document for the specified userId
    const levels = await Level.findOne({ userId }); // Assuming one document per userId
    // console.log({ levels });

    // Check if levels exist and filter level 1 users
    const distributorLvl = levels?.level?.filter((d) => d?.userId);
    // console.log("User Id: ", distributorLvl);

    // Extract userId values dynamically
    const userIds = distributorLvl?.map((d) => d.userId) || [];
    console.log("User Id Array: ", userIds);

    // Fetch investment amount and user count
    const [investmentData] = await Wallet.aggregate([
      {
        $match: {
          userId: { $in: userIds }, // Filter by userIds
        },
      },
      {
        $group: {
          _id: null,
          totalInvestmentAmount: { $sum: "$investmentAmount" }, // Sum of investment amounts
          userCount: { $sum: 1 }, // Count the number of users
        },
      },
    ]);

    // Prepare result
    const result = {
      totalInvestmentAmount: investmentData?.totalInvestmentAmount || 0,
      userCount: investmentData?.userCount || 0,
    };

    console.log("Result: ", result);
    return result; // Return the result
  } catch (error) {
    console.log("Level Error", error);
    throw error; // Re-throw the error to handle it at a higher level
  }
};

module.exports = CalculateLinePackageAmount;
