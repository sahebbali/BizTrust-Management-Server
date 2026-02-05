const User = require("../models/auth.model");
const Level = require("../models/level.model");
const updateLevel = require("./updateLavel");

const buildInfiniteLevels = async (newUser) => {
  let currentSponsorId = newUser.sponsorId;
  let levelNumber = 1;

  const MAX_LEVEL = 1000; // safety guard (optional)

  while (currentSponsorId && levelNumber <= MAX_LEVEL) {
    const sponsorUser = await User.findOne({ userId: currentSponsorId });

    if (!sponsorUser) break;

    const sponsorLevel = await Level.findOne({
      userId: sponsorUser.userId,
    });

    if (!sponsorLevel) break;

    await updateLevel(sponsorUser, newUser, levelNumber);

    // move upward
    currentSponsorId = sponsorUser.sponsorId;
    levelNumber++;
    console.log(
      `Level ${levelNumber} updated for sponsor ${sponsorUser.userId}`,
    );
  }
};

module.exports = buildInfiniteLevels;
