const generateRandomString = require("../config/generateRandomId");
const { rankRewardAmount } = require("../constants/topup.constants");
const User = require("../models/auth.model");
const { RankIncome } = require("../models/rankIncome.model");
const { PackageRoi, PackageBuyInfo } = require("../models/topup.model");
const cron = require("node-cron");
const Wallet = require("../models/wallet.model");
const getIstTime = require("../config/getTime");
const { getIstTimeWithInternet } = require("../config/internetTime");
const Level = require("../models/level.model");
const updateLevel = require("./updateLavel");
const colors = require("colors");
const getDatesInRange = require("../config/getDatesInRange");

const findOldRankUsersBugUtil = async (userId) => {
  // const user = await User.findOne({ userId: userId });

  // const activeUsers = [];
  // const inActiveUsers = [];

  // for (const t of user.team) {
  //   const isActive = await User.findOne({
  //     userId: t.userId,
  //     isActive: true,
  //   });
  //   if (isActive) {
  //     activeUsers.push({ userId: t.userId });
  //   } else {
  //     inActiveUsers.push(t.userId);
  //   }
  // }

  // for (const id of inActiveUsers) {
  //   let totalInvest = 0;
  //   let totalWithdraw = 0;

  //   const packages = await PackageBuyInfo.find({ userId: id }).sort({
  //     createdAt: 1,
  //   });

  //   for (const p of packages) {
  //     if (p.packageType === "Withdraw IA") {
  //       totalWithdraw += p.packageInfo.amount;
  //     } else {
  //       totalInvest += p.upgradedAmount;
  //     }
  //   }

  //   if (totalWithdraw > totalInvest) {
  //     console.log(totalWithdraw, "-", totalInvest);
  //     console.log(id);
  //   }
  // }

  // const ranks = await RankIncome.find({});
  // const currentRanks = [];

  // for (const i of ranks) {
  //   const isExist = currentRanks.find((item) => item.userId === i.userId);

  //   if (isExist) {
  //     isExist.ranks.push({
  //       rankName: i.rank,
  //       amount: i.rewardAmount,
  //       date: i.date,
  //     });
  //   } else {
  //     currentRanks.push({
  //       userId: i.userId,
  //       ranks: [
  //         {
  //           rankName: i.rank,
  //           amount: i.rewardAmount,
  //           date: i.date,
  //         },
  //       ],
  //     });
  //   }
  // }

  // const match = currentRanks.find((item) => item.userId === userId);
  // console.log(match.ranks[match.ranks.length - 1].rankName);

  const user = await User.findOne({ userId });
  let totalWithdraw = 0;

  for (const tu of user.team) {
    const packageBuyInfos = await PackageBuyInfo.find({ userId: tu.userId });

    for (const p of packageBuyInfos) {
      if (p.packageType === "Withdraw IA") {
        totalWithdraw += p.packageInfo.amount;
      }
    }
  }

  console.log(totalWithdraw);
};

const updateRankIncomeCurrentDateOfMissingDateUtil = async (query) => {
  const allRankIncomes = await RankIncome.find(query).select({
    _id: 0,
    userId: 1,
  });

  const unique = [];

  for (const rankIncome of allRankIncomes) {
    if (!unique.includes(rankIncome.userId)) {
      // const rankIncomes = await RankIncome.find({
      //   userId: rankIncome.userId,
      // }).select({
      //   _id: 0,
      //   userId: 1,
      //   date: 1,
      // });

      // if (rankIncomes.length === 0) {
      //   console.log("No rank incomes found for the user.");
      //   return null;
      // }

      // const lastRankIncome = rankIncomes[rankIncomes.length - 1];

      const user = await User.findOne({ userId: rankIncome.userId });
      let checkNext30Days = new Date(user.rankIncomeCurrentDate);
      checkNext30Days.setDate(checkNext30Days.getDate() + 30);
      let next30Days = checkNext30Days.getTime();

      // const today = new Date().getTime();

      // while (next30Days < today) {
      //   checkNext30Days.setDate(checkNext30Days.getDate() + 30);
      //   next30Days = checkNext30Days.getTime();
      // }

      // checkNext30Days.setDate(checkNext30Days.getDate() - 29);

      // const lastDate = new Date(lastRankIncome.date).toDateString();
      // const nextDate = new Date(checkNext30Days).toDateString();

      // if (lastDate !== nextDate) {
      //   checkNext30Days.setDate(checkNext30Days.getDate() - 1);
      // }

      // const check = new Date(checkNext30Days);
      // check.setDate(checkNext30Days.getDate() + 1);

      console.log(
        "User ID:",
        user.userId,
        "Last rank income date:",
        new Date(user.rankIncomeCurrentDate).toDateString(),
        "- Next valid date:",
        new Date(checkNext30Days).toDateString()
      );

      // await User.findOneAndUpdate(
      //   { userId: lastRankIncome.userId },
      //   {
      //     $set: {
      //       rankIncomeCurrentDate: new Date(checkNext30Days).getTime(),
      //     },
      //   }
      // );

      unique.push(rankIncome.userId);
    }
  }

  // If needed, perform any action with the final calculated date
  // e.g., updating the database with this date

  return null;
};

const checkDate = (firstDate, secondDate, lastDate) => {
  // Convert the dates to Date objects
  const date1 = new Date(firstDate);
  const date2 = new Date(secondDate);
  const date3 = new Date(lastDate);

  // Function to adjust date to IST
  const toIST = (date) => {
    const offset = date.getTimezoneOffset() * 60000;
    const istOffset = 19800000; // IST is UTC + 5:30 => 5.5 * 60 * 60 * 1000 = 19800000 ms
    return new Date(date.getTime() + offset + istOffset);
  };

  // Normalize the dates to ignore the time part for comparison and adjust to IST
  const d1 = new Date(toIST(date1).toISOString().split("T")[0]);
  const d2 = new Date(toIST(date2).toISOString().split("T")[0]);
  const d3 = new Date(toIST(date3).toISOString().split("T")[0]);

  // Check if firstDate matches secondDate or lastDate
  const isMatch =
    new Date(d1).toDateString() === new Date(d2).toDateString() ||
    new Date(d1).toDateString() === new Date(d3).toDateString();

  // Check if firstDate is between secondDate and lastDate
  const isInBetween =
    d1.getTime() > d2.getTime() && d1.getTime() < d3.getTime();

  const isTrue = isMatch || isInBetween;

  return isTrue;
};

const isLastDayOfMonth = async (timestamp) => {
  const ISTTime = await getIstTimeWithInternet();
  const today = new Date(
    ISTTime?.date ? ISTTime?.date : getIstTime().date
  ).getTime();
  return timestamp <= today;
};

const findHigherRankTotalTeamBusiness = async (team, userId, rankName) => {
  let totalDirectTeamBusiness = 0;
  let totalAllLevelTeamBusiness = 0;
  let directActiveUsersCount = 0;
  let conditionIsTrue = false;

  directActiveUsersCount = await User.countDocuments({
    sponsorId: userId,
    isActive: true,
  });

  for (const m of team) {
    const activeUser = await User.findOne({
      userId: m?.userId,
      isActive: true,
    }).select({ _id: 0, userId: 1 });

    if (activeUser) {
      const packageBuyInfos = await PackageBuyInfo.find({
        userId: activeUser?.userId,
      });

      for (const p of packageBuyInfos) {
        const amount = p?.upgradedAmount
          ? p?.upgradedAmount
          : -p?.packageInfo?.amount;

        if (m.level === "1") {
          totalDirectTeamBusiness += amount;
        }
        totalAllLevelTeamBusiness += amount;
      }
    }
  }

  const requiredRankInfo = rankName ? rankRewardAmount[rankName] : null;

  if (requiredRankInfo) {
    conditionIsTrue =
      directActiveUsersCount >= requiredRankInfo?.directUsers &&
      totalDirectTeamBusiness >= requiredRankInfo?.level1Business &&
      totalAllLevelTeamBusiness >= requiredRankInfo?.allLevelBusiness;
  }

  return conditionIsTrue;
};

const findTotalTeamBusinesses = async (
  user,
  rankName,
  bonusAmount,
  higherRankName,
  requiredDirectTeamCount,
  requiredDirectTeamBusiness,
  requiredAllTeamBusiness
) => {
  const userId = user?.userId;
  const team = user?.team;
  const rankIncomeCurrentDate = user?.rankIncomeCurrentDateString;

  const checkNext30Days = new Date(rankIncomeCurrentDate);
  checkNext30Days.setDate(checkNext30Days.getDate() + 29);
  const next30Days = checkNext30Days.getTime();

  const dates = getDatesInRange(
    new Date(user?.rankIncomeCurrentDateString).toDateString(),
    new Date(next30Days).toDateString()
  );

  const extRank = await RankIncome.findOne({
    userId: userId,
    rank: rankName,
  });

  if (extRank?.rank) {
    console.log(
      `User ID: ${userId} Date range for ${extRank?.rank}: ${new Date(
        user?.rankIncomeCurrentDateString
      ).toDateString()} -- ${new Date(next30Days).toDateString()}`.yellow
    );
  }

  const extBonus = await RankIncome.findOne({
    userId: userId,
    rank: rankName,
    bonusAmount: bonusAmount,
  });

  const directActiveUsersCount = await User.countDocuments({
    sponsorId: userId,
    isActive: true,
  });

  const isRankPresent = extRank?.rank;
  let totalDirectTeamBusiness = 0;
  let totalAllLevelTeamBusiness = 0;
  const updatedDataStore = [];

  for (const t of team) {
    let withoutWithdrawAmountForDirect = 0;
    let withdrawAmountForDirect = 0;
    let withoutWithdrawAmountForAll = 0;
    let withdrawAmountForAll = 0;

    const activeUser = await User.findOne({
      userId: t?.userId,
      isActive: true,
    }).select({ _id: 0, userId: 1 });

    if (activeUser) {
      const packageBuyInfos = await PackageBuyInfo.find({
        userId: t?.userId,
      });

      for (const p of packageBuyInfos) {
        const isDateValid = dates.includes(p?.packageInfo?.date);

        const isAlreadyUsed = p?.usedIds?.includes(userId);
        if (isRankPresent) {
          if (!isAlreadyUsed) {
            if (isDateValid) {
              if (t?.level === "1") {
                if (p.packageType === "Withdraw IA") {
                  withdrawAmountForDirect += p?.packageInfo?.amount;
                } else {
                  withoutWithdrawAmountForDirect += p?.upgradedAmount;
                }
              }
              if (p?.packageType === "Withdraw IA") {
                withdrawAmountForAll += p?.packageInfo?.amount;
              } else {
                withoutWithdrawAmountForAll += p?.upgradedAmount;
              }
              updatedDataStore.push({
                updateOne: {
                  filter: { _id: p._id },
                  update: { $push: { usedIds: userId } },
                },
              });
            }
          }
        } else {
          if (t?.level === "1") {
            if (p?.packageType === "Withdraw IA") {
              withdrawAmountForDirect += p?.packageInfo?.amount;
            } else {
              withoutWithdrawAmountForDirect += p?.upgradedAmount;
            }
          }
          if (p?.packageType === "Withdraw IA") {
            withdrawAmountForAll += p?.packageInfo?.amount;
          } else {
            withoutWithdrawAmountForAll += p?.upgradedAmount;
          }
          updatedDataStore.push({
            updateOne: {
              filter: { _id: p._id },
              update: { $push: { usedIds: userId } },
            },
          });
        }
      }
    }
    totalDirectTeamBusiness +=
      withoutWithdrawAmountForDirect - withdrawAmountForDirect;

    totalAllLevelTeamBusiness +=
      withoutWithdrawAmountForAll - withdrawAmountForAll;
  }

  let fullCondition = false;
  let halfCondition = false;
  let higherRankFullCondition = false;

  const isFiveThousandShouldCheck = [
    "double-diamond",
    "platinum-diamond",
    "double-platinum-diamond",
    "crown-diamond",
    "double-crown-diamond",
    "legend-diamond",
  ].includes(rankName);

  if (!isRankPresent) {
    fullCondition =
      directActiveUsersCount >= requiredDirectTeamCount &&
      totalDirectTeamBusiness >= requiredDirectTeamBusiness &&
      totalAllLevelTeamBusiness >= requiredAllTeamBusiness;
  }

  if (isRankPresent) {
    halfCondition =
      totalDirectTeamBusiness >=
        (isFiveThousandShouldCheck ? 5000 : requiredDirectTeamBusiness / 2) &&
      totalAllLevelTeamBusiness >= requiredAllTeamBusiness / 2;

    higherRankFullCondition = await findHigherRankTotalTeamBusiness(
      team,
      userId,
      higherRankName
    );
  }

  return {
    extRank,
    extBonus,
    updatedDataStore,
    fullCondition,
    halfCondition,
    higherRankFullCondition,
    directActiveUsersCount,
    totalDirectTeamBusiness,
    totalAllLevelTeamBusiness,
    isFiveThousandShouldCheck,
  };
};

const distributorFunc = async (
  user,
  rankName,
  higherRankName,
  rewardAmount,
  requiredDirectTeamCount,
  requiredDirectTeamBusiness,
  requiredAllTeamBusiness,
  rankNumber,
  bonusAmount
) => {
  const ISTTime = await getIstTimeWithInternet();
  const userId = user?.userId;
  const team = user?.team;

  const higherRankDoesExist = await RankIncome.exists({
    userId: userId,
    rankPosition: { $gt: rankNumber },
  });

  if (higherRankDoesExist) return;

  const {
    extRank,
    extBonus,
    updatedDataStore,
    fullCondition,
    halfCondition,
    higherRankFullCondition,
    directActiveUsersCount,
    totalDirectTeamBusiness,
    totalAllLevelTeamBusiness,
    isFiveThousandShouldCheck,
  } = await findTotalTeamBusinesses(
    user,
    rankName,
    bonusAmount,
    higherRankName,
    requiredDirectTeamCount,
    requiredDirectTeamBusiness,
    requiredAllTeamBusiness
  );

  console.log(
    `...........................................................
    User ID: ${userId}
    Rank name: ${rankName}
    Repeated: ${!!extRank?.rank}
  
    Direct Active Users Count: ${directActiveUsersCount}
    Required Direct Active Users Count: ${requiredDirectTeamCount}
  
    Total Direct Team Business: ${totalDirectTeamBusiness}
    Required Direct Team Business: ${
      !!extRank?.rank
        ? isFiveThousandShouldCheck
          ? 5000
          : requiredDirectTeamBusiness / 2
        : requiredDirectTeamBusiness
    }
  
    Total All Level Team Business: ${totalAllLevelTeamBusiness}
    Required Total All Level Team Business: ${
      !!extRank?.rank ? requiredAllTeamBusiness / 2 : requiredAllTeamBusiness
    }
  
    Full Condition: ${fullCondition}
    Half Condition: ${halfCondition}
    ...........................................................`.grey
  );

  if (higherRankFullCondition && !!extRank?.rank) return;

  const checkThirtyFirstDay = new Date(user?.rankIncomeCurrentDateString);
  checkThirtyFirstDay.setDate(checkThirtyFirstDay.getDate() + 30);
  const thirtyFirstDay = checkThirtyFirstDay.getTime();

  const isLastDateOfMonth = await isLastDayOfMonth(thirtyFirstDay);

  if (fullCondition || (halfCondition && isLastDateOfMonth)) {
    const rankIncomeData = {
      userId: user?.userId,
      fullName: user?.fullName,
      sponsorId: user?.sponsorId,
      sponsorName: user?.sponsorName,
      rank: rankName,
      rankPosition: rankNumber,
      rewardAmount: rewardAmount,
      requiredDirectActiveUsers: requiredDirectTeamCount,
      requiredDirectLevelAmount: fullCondition
        ? requiredDirectTeamBusiness
        : !isFiveThousandShouldCheck
        ? requiredDirectTeamBusiness / 2
        : 5000,
      requiredAllLevelAmount: fullCondition
        ? requiredAllTeamBusiness
        : requiredAllTeamBusiness / 2,
      totalDirectActiveUsers: directActiveUsersCount,
      totalDirectLevelAmount: totalDirectTeamBusiness,
      totalAllLevelAmount: totalAllLevelTeamBusiness,
      date: new Date(
        ISTTime?.date ? ISTTime?.date : getIstTime().date
      ).toDateString(),
      time: ISTTime?.time ? ISTTime?.time : getIstTime().time,
      transactionId: generateRandomString(),
    };

    if (bonusAmount && !extBonus) {
      rankIncomeData.bonusAmount = bonusAmount;
    }

    await RankIncome.create(rankIncomeData);

    await Wallet.findOneAndUpdate(
      { userId: user?.userId },
      {
        $inc: {
          rankIncome: +rewardAmount,
          rankBonusIncome: !extBonus ? bonusAmount || 0 : 0,
          totalIncome: (!extBonus ? bonusAmount || 0 : 0) + +rewardAmount,
          activeIncome: (!extBonus ? bonusAmount || 0 : 0) + +rewardAmount,
        },
      },
      { new: true, lean: true }
    );

    await User.findOneAndUpdate(
      { userId: user?.userId },
      {
        $set: {
          rankIncomeCurrentDate: new Date(
            ISTTime?.date ? ISTTime?.date : getIstTime().date
          ).getTime(),
          rankIncomeCurrentDateString: new Date(
            ISTTime?.date ? ISTTime?.date : getIstTime().date
          ).toDateString(),
          rank: rankName,
        },
      }
    );

    await PackageBuyInfo.bulkWrite(updatedDataStore);
  } else if (isLastDateOfMonth) {
    await User.findOneAndUpdate(
      { userId: user?.userId },
      {
        $set: {
          rankIncomeCurrentDate: new Date(
            ISTTime?.date ? ISTTime?.date : getIstTime().date
          ).getTime(),
          rankIncomeCurrentDateString: new Date(
            ISTTime?.date ? ISTTime?.date : getIstTime().date
          ).toDateString(),
        },
      }
    );
  }
};

const distributeRankIncome = async () => {
  /*
      1. Rank income will not be distributed on Saturday and Sunday.
      2. If an user is active after investment and has got no rank yet, the system should check only the first time conditions, which are - direct team count, direct team total business and all level team total business.
    */
  const ISTTime = await getIstTimeWithInternet();
  const dateStringToCheck = new Date(
    ISTTime?.date ? ISTTime?.date : getIstTime().date
  ).toDateString();
  const isSatOrSun =
    dateStringToCheck.includes("Sat") || dateStringToCheck.includes("Sun");

  // Rank Income isn't distributed on Saturday and Sunday
  if (isSatOrSun) {
    return;
  }

  const users = await User.find({
    isActive: true,
    // userId: {
    //   $in: ["884305"],
    // },
  });

  for (const user of users) {
    await distributorFunc(
      user,
      "silver",
      "GOLD",
      rankRewardAmount.SILVER.rewardAmount,
      rankRewardAmount.SILVER.directUsers,
      rankRewardAmount.SILVER.level1Business,
      rankRewardAmount.SILVER.allLevelBusiness,
      rankRewardAmount.SILVER.position
    );
    await distributorFunc(
      user,
      "gold",
      "RUBY",
      rankRewardAmount.GOLD.rewardAmount,
      rankRewardAmount.GOLD.directUsers,
      rankRewardAmount.GOLD.level1Business,
      rankRewardAmount.GOLD.allLevelBusiness,
      rankRewardAmount.GOLD.position
    );
    await distributorFunc(
      user,
      "ruby",
      "DIAMOND",
      rankRewardAmount.RUBY.rewardAmount,
      rankRewardAmount.RUBY.directUsers,
      rankRewardAmount.RUBY.level1Business,
      rankRewardAmount.RUBY.allLevelBusiness,
      rankRewardAmount.RUBY.position
    );
    await distributorFunc(
      user,
      "diamond",
      "DOUBLE_DIAMOND",
      rankRewardAmount.DIAMOND.rewardAmount,
      rankRewardAmount.DIAMOND.directUsers,
      rankRewardAmount.DIAMOND.level1Business,
      rankRewardAmount.DIAMOND.allLevelBusiness,
      rankRewardAmount.DIAMOND.position
    );
    await distributorFunc(
      user,
      "double-diamond",
      "PLATINUM_DIAMOND",
      rankRewardAmount.DOUBLE_DIAMOND.rewardAmount,
      rankRewardAmount.DOUBLE_DIAMOND.directUsers,
      rankRewardAmount.DOUBLE_DIAMOND.level1Business,
      rankRewardAmount.DOUBLE_DIAMOND.allLevelBusiness,
      rankRewardAmount.DOUBLE_DIAMOND.position,
      rankRewardAmount.DOUBLE_DIAMOND.bonus
    );
    await distributorFunc(
      user,
      "platinum-diamond",
      "DOUBLE_PLATINUM_DIAMOND",
      rankRewardAmount.PLATINUM_DIAMOND.rewardAmount,
      rankRewardAmount.PLATINUM_DIAMOND.directUsers,
      rankRewardAmount.PLATINUM_DIAMOND.level1Business,
      rankRewardAmount.PLATINUM_DIAMOND.allLevelBusiness,
      rankRewardAmount.PLATINUM_DIAMOND.position,
      rankRewardAmount.PLATINUM_DIAMOND.bonus
    );
    await distributorFunc(
      user,
      "double-platinum-diamond",
      "CROWN_DIAMOND",
      rankRewardAmount.DOUBLE_PLATINUM_DIAMOND.rewardAmount,
      rankRewardAmount.DOUBLE_PLATINUM_DIAMOND.directUsers,
      rankRewardAmount.DOUBLE_PLATINUM_DIAMOND.level1Business,
      rankRewardAmount.DOUBLE_PLATINUM_DIAMOND.allLevelBusiness,
      rankRewardAmount.DOUBLE_PLATINUM_DIAMOND.position,
      rankRewardAmount.DOUBLE_PLATINUM_DIAMOND.bonus
    );
    await distributorFunc(
      user,
      "crown-diamond",
      "DOUBLE_CROWN_DIAMOND",
      rankRewardAmount.CROWN_DIAMOND.rewardAmount,
      rankRewardAmount.CROWN_DIAMOND.directUsers,
      rankRewardAmount.CROWN_DIAMOND.level1Business,
      rankRewardAmount.CROWN_DIAMOND.allLevelBusiness,
      rankRewardAmount.CROWN_DIAMOND.position,
      rankRewardAmount.CROWN_DIAMOND.bonus
    );
    await distributorFunc(
      user,
      "double-crown-diamond",
      "LEGEND_DIAMOND",
      rankRewardAmount.DOUBLE_CROWN_DIAMOND.rewardAmount,
      rankRewardAmount.DOUBLE_CROWN_DIAMOND.directUsers,
      rankRewardAmount.DOUBLE_CROWN_DIAMOND.level1Business,
      rankRewardAmount.DOUBLE_CROWN_DIAMOND.allLevelBusiness,
      rankRewardAmount.DOUBLE_CROWN_DIAMOND.position,
      rankRewardAmount.DOUBLE_CROWN_DIAMOND.bonus
    );
    await distributorFunc(
      user,
      "legend-diamond",
      "",
      rankRewardAmount.LEGEND_DIAMOND.rewardAmount,
      rankRewardAmount.LEGEND_DIAMOND.directUsers,
      rankRewardAmount.LEGEND_DIAMOND.level1Business,
      rankRewardAmount.LEGEND_DIAMOND.allLevelBusiness,
      rankRewardAmount.LEGEND_DIAMOND.position,
      rankRewardAmount.LEGEND_DIAMOND.bonus
    );
  }

  // await updateRankIncomeCurrentDateOfMissingDateUtil({});
  // await findOldRankUsersBugUtil("317423");
};

const runRankIncomeDistribution = () => {
  cron.schedule(
    "00 00 00 * * *",
    async () => {
      try {
        await distributeRankIncome();
      } catch (error) {
        console.log("error: ", error);
      }
    },
    { scheduled: true, timezone: "Asia/Kolkata" }
  );
};

module.exports = {
  checkDate,
  distributeRankIncome,
  runRankIncomeDistribution,
};
