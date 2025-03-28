const cron = require("node-cron");
const handleROI = require("./handleROI");
const handleFirstROI = require("./handleFirstROI");

const runPackageROI = () => {
  cron.schedule(
    "00 00 00 * * *", // This function will run Every Night 12 AM PST
    // "35 1 * * *", // This function will run Every Night 01:35 AM PST
    // "*/3 * * * *", // Every 03 mins
    // "*/10 * * * * *", // every 59 secs
    async () => {
      try {
        await Promise.all([
          handleROI(), // ROI Income
          handleFirstROI(), // First ROI Income
        ]);
      } catch (error) {
        console.log({ error });
      }
    },
    { scheduled: true, timezone: "Asia/Karachi" }
  );
};

module.exports = runPackageROI;
