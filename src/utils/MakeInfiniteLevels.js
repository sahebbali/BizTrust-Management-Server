const User = require("../models/auth.model");
const Level = require("../models/level.model");
const updateLevel = require("./updateLavel");

const MakeInfiniteLevels = async () => {
  const AllUsers = await User.find(
    { userId: { $ne: "admin" } },
    {
      userId: 1,
      sponsorId: 1,
      activationDate: 1,
      joiningDate: 1,
      email: 1,
      mobile: 1,
      fullName: 1,
      _id: 0,
    },
  ).sort({ createdAt: -1 }); // Sort by creation date (newest first)

  console.log(`Total users to process: ${AllUsers.length}`);

  for (const user of AllUsers) {
    console.log(
      `Processing user ${user.userId} with sponsor ${user.sponsorId}`,
    );
    let currentSponsorId = user.sponsorId;
    let levelNumber = 1;

    const MAX_LEVEL = 50; // safety guard (optional)

    while (currentSponsorId && levelNumber <= MAX_LEVEL) {
      const sponsorUser = await User.findOne({ userId: currentSponsorId });

      if (!sponsorUser) break;

      const sponsorLevel = await Level.findOne({
        userId: sponsorUser.userId,
      });

      const levelExists = await Level.findOne({
        userId: sponsorUser.userId,
        "level.userId": user.userId,
      });

      if (!sponsorLevel) break;
      console.log(
        `At level ${levelNumber}, sponsor ${sponsorUser.userId} found for user ${user.userId}`,
      );
      if (!levelExists && levelNumber > 5) {
        console.log(
          `Level ${levelNumber}  for sponsor ${sponsorUser.userId}, skipping update for user ${user.userId}`,
        );
        await updateLevel(sponsorUser, user, levelNumber);
      }

      // console.log("levelExists:", levelExists);

      // move upward
      currentSponsorId = sponsorUser.sponsorId;
      levelNumber++;
      // console.log(
      //   `Level ${levelNumber} updated for sponsor ${sponsorUser.userId}`,
      // );
    }
  }
};

module.exports = MakeInfiniteLevels;
