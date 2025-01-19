const cron = require("node-cron");
const handleROI = require("./handleROI");
const levelIncome = require("./levelIncome");
const { rankIncome } = require("./rankIncome");
const { ResetMonthlyTeamBusiness } = require("./ResetMonthlyTeamBusiness");
const scriptToTrackTheRankEligibility = require("./scriptToTrackTheRankEligibility");
const runPackageROI = () => {
  cron.schedule(
    "00 00 00 * * *", // This function will run Every Night 12 AM IST
    // "35 1 * * *", // This function will run Every Night 01:35 AM IST
    // "*/3 * * * *", // Every 03 mins
    // "*/10 * * * * *", // every 59 secs
    async () => {
      try {
        await Promise.all([
          handleROI(), // ROI Income
          levelIncome(), // Level ROI Income
          rankIncome(), // Rank Income
          ResetMonthlyTeamBusiness(), // reset This month team business
          scriptToTrackTheRankEligibility(), // It keep tracking the rank eligibility.
        ]);
      } catch (error) {
        console.log({ error });
      }
    },
    { scheduled: true, timezone: "Asia/Kolkata" }
  );
};

module.exports = runPackageROI;
