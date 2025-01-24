const Level = require("../models/level.model");
const CalculateLinePackageAmount = require("./CalculateLinePackageAmount");

const rewardIncome = async (userId) => {
  console.log("hello");
  try {
    // Find the document for the specified userId
    const levels = await Level.findOne({ userId }); // Assuming one document per userId
    console.log({ levels });

    // Check if levels exist and filter level 1 users
    const distributorLvl = levels?.level?.filter((d) => d?.level === "1");
    console.log("level", distributorLvl);

    distributorLvl.map(async (user) => {
      console.log("userId:----------", user.userId);
      const line = await CalculateLinePackageAmount(user.userId);
    });

    return distributorLvl; // Return the filtered level 1 users
  } catch (error) {
    console.log("Level Error", error);
  }
};

module.exports = rewardIncome;
