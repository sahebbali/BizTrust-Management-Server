const Level = require("../models/level.model");
const CalculateLinePackageAmount = require("./CalculateLinePackageAmount");

const CreateRewardHistory = async(user, designation, amount, position)=>{

}
const rewardIncome = async (userId) => {
  try {
    console.log("Fetching levels for user:", userId);
    
    // Find the document for the specified userId
    const levels = await Level.findOne({ userId });
    if (!levels) {
      console.log("No levels found for user:", userId);
      return [];
    }

    // Filter users at level 1
    const distributorLvl = levels.level?.filter((d) => d.level === "1") || [];
    console.log("Filtered Level 1 Users:", distributorLvl);

    // Use Promise.all to handle async operations properly
    const allLine = await Promise.all(
      distributorLvl.map(async (user) => {
        console.log("Processing userId:", user.userId);
        return CalculateLinePackageAmount(user.userId);
      })
    );
  // Sort data by totalInvestmentAmount in descending order
  allLine.sort((a, b) => b.totalInvestmentAmount - a.totalInvestmentAmount);
    console.log("Calculated Line Packages:", allLine);
    console.log(allLine.length)
    if(allLine[0] >=3000000 && allLine[1] >=1500000 ){
      await CreateRewardHistory(userId,"Relationship Manager",  150000, 1 )
    } 
    
    else if(allLine[0] >=6000000 && allLine[1] >=5000000 && allLine[2] >= 4000000){
      await CreateRewardHistory(userId,"Branch Manager",  300000, 2 )
    }
    else if(allLine[0] >=60000000 && allLine[1] >=60000000 && allLine[2] >= 45000000 && allLine[3] >=1000000){
      await CreateRewardHistory(userId,"Area Manager",  "1300CC CAR", 3 )
    }
    else if(allLine[0] >=114000000 && allLine[1] >=85000000 && allLine[2] >= 85000000 && allLine[3] >=75000000 && allLine[4] >=75000000
    ){
      await CreateRewardHistory(userId,"Regional Manager",  "1800CC CAR", 4 )
    }
    return distributorLvl;
  } catch (error) {
    console.error("Error in rewardIncome:", error);
    throw error; // Rethrow error for better error handling
  }
};

module.exports = rewardIncome;
