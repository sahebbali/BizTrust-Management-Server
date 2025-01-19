const getIstTime = require("../config/getTime");
const ThisMonthTeamBusinessIncome = require("../models/ThisMonthTeamBusiness");
const User = require("../models/auth.model");
const { RankIncome } = require("../models/rankIncome.model");

const ResetMonthlyTeamBusiness = async () => {
  try {
    const existRank = await RankIncome.find({});

    for (rank of existRank) {
      const user = await User.findOne({ userId: rank.userId });
      let currentDate = new Date(`${rank?.date},${rank?.time}`).getTime();
      currentDate.setDate(currentDate.getDate() + 31);

      const next30Days = currentDate.getTime();
      if (isLastDayOfMonth(next30Days)) {
        await ThisMonthTeamBusinessIncome.findOneAndUpdate(
          { userId: rank.userId },
          { $set: { teamBusiness: 0 } }
        );
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const isLastDayOfMonth = (timestamp) => {
  const today = new Date(getIstTime().date).getTime();
  return timestamp <= today;
};

module.exports = { ResetMonthlyTeamBusiness };
