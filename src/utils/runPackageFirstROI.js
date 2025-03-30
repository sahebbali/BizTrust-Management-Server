const cron = require("node-cron");
const handleFirstROI = require("./handleFirstROI");

const runPackageFirstROI = () => {
  cron.schedule(
    "*/5 * * * *", // Every 05 mins
    async () => {
      try {
        await Promise.all([
          handleFirstROI(), // ROI Income
        ]);
      } catch (error) {
        console.log({ error });
      }
    },
    { scheduled: true, timezone: "Asia/Karachi" }
  );
};

module.exports = runPackageFirstROI;
