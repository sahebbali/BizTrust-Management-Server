const getIstTime = require("../config/getTime");
const ThisMonthTeamBusinessIncome = require("../models/ThisMonthTeamBusiness");
const User = require("../models/auth.model");
const Level = require("../models/level.model");
const { RankIncome } = require("../models/rankIncome.model");
const { ThisMonthTeamBusinessHistory } = require("../models/thisMonthTeamBusinessHistory");

const ThisMonthTeamBusiness = async (userId, amount) => {
  // Generate today's date

  console.log(userId, amount)

  const absoluteValue = Math.abs(amount);

  const isLastDayOfMonth = (timestamp) => {
    const today = new Date(getIstTime().date).getTime();
    return timestamp >= today;
  };
  try {
    const upLineLevels = await Level.aggregate([
      {
        $match: {
          "level.userId": userId,
        },
      },
      {
        $unwind: "$level",
      },
      {
        $match: {
          "level.userId": userId,
        },
      },
      {
        $project: {
          userId: "$level.userId",
          name: "$level.fullName",
          levelNumber: { $toInt: "$level.level" },
          parentUserId: "$userId",
          parentName: "$fullName",
          _id: 0,
        },
      },
    ]);

    for (const level of upLineLevels) {
      // Assuming RankIncome returns a Promise that resolves to an array
      const existRank = await RankIncome.findOne({
        userId: level.parentUserId,
      }).sort({
        createdAt: -1,
        rankPosition: -1
      });

      if (existRank) {
        const user = await User.findOne({ userId: level.parentUserId });
        // const rankDate = new Date(existRank?.PackageBuyInfo?.date).getTime()
        const rankDate = new Date(`${existRank?.date},${existRank?.time}`).getTime();

        let currentDate = new Date(rankDate);
        currentDate.setDate(currentDate.getDate() + 31);
        const next30Days = currentDate.getTime();

        if (next30Days > rankDate) {
          const existIncome = await ThisMonthTeamBusinessIncome.findOne({
            userId: level.parentUserId,
          });
          await ThisMonthTeamBusinessHistory.create({
            parentUserId: level?.parentUserId,
            userId: level?.userId,
            fullName: level?.name,
            level: level?.levelNumber,
            packageAmount: absoluteValue,
            date: new Date(getIstTime().date).toDateString(),
            time: getIstTime().time
          })
          if (existIncome) {
            await ThisMonthTeamBusinessIncome.findOneAndUpdate(
              { userId: level.parentUserId },
              {
                $inc: {
                  teamBusiness: +absoluteValue,
                },
              }
            );
          } else {
            await ThisMonthTeamBusinessIncome.create({
              userId: level.parentUserId,
              fullName: level.parentName,
              teamBusiness: absoluteValue,
            });
          }
        }
      }
    }
  } catch (error) {
    console.log({ error });
    // return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { ThisMonthTeamBusiness };
