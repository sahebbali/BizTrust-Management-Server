const topUpPackageAmount = [
  30, 70, 100, 250, 500, 700, 1000, 1500, 2000, 3500, 5000, 7500, 10000,
];

const roiCommissionPercentage = {
  thirtyTo5Hundred: 0.31,
  sevenHundredTo3k: 0.36,
  fiveKToN: 0.4,
};

const levelCommissionPerCentage = {
  1: 0.15,
  2: 0.1,
  3: 0.05,
  4: 0.01,
  5: 0.01,
  6: 0.01,
  7: 0.01,
};

const rankRewardAmount = {
  SILVER: {
    rewardAmount: 50,
    directUsers: 5,
    level1Business: 1000,
    allLevelBusiness: 5000,
    position: 1,
  },
  GOLD: {
    rewardAmount: 50,
    directUsers: 10,
    level1Business: 2000,
    allLevelBusiness: 10000,
    position: 2,
  },
  RUBY: {
    rewardAmount: 100,
    directUsers: 15,
    level1Business: 4000,
    allLevelBusiness: 20000,
    position: 3,
  },
  DIAMOND: {
    rewardAmount: 300,
    directUsers: 20,
    level1Business: 8000,
    allLevelBusiness: 50000,
    position: 4,
  },
  DOUBLE_DIAMOND: {
    rewardAmount: 500,
    bonus: 500,
    directUsers: 25,
    level1Business: 16000,
    allLevelBusiness: 100000,
    position: 5,
  },
  PLATINUM_DIAMOND: {
    rewardAmount: 1000,
    bonus: 1000,
    directUsers: 0,
    level1Business: 30000,
    allLevelBusiness: 200000,
    position: 6,
  },
  DOUBLE_PLATINUM_DIAMOND: {
    rewardAmount: 2000,
    bonus: 2000,
    directUsers: 0,
    level1Business: 40000,
    allLevelBusiness: 400000,
    position: 7,
  },
  CROWN_DIAMOND: {
    rewardAmount: 4000,
    bonus: 4000,
    directUsers: 0,
    level1Business: 50000,
    allLevelBusiness: 800000,
    position: 8,
  },
  DOUBLE_CROWN_DIAMOND: {
    rewardAmount: 5000,
    bonus: 5000,
    directUsers: 0,
    level1Business: 60000,
    allLevelBusiness: 1300000,
    position: 9,
  },
  LEGEND_DIAMOND: {
    rewardAmount: 6000,
    bonus: 6000,
    directUsers: 0,
    level1Business: 70000,
    allLevelBusiness: 1900000,
    position: 10,
  },
};

const forbiddenDates = [
  "Dec 24",
  "Dec 25",
  "Dec 26",
  "Dec 27",
  "Dec 28",
  "Dec 29",
  "Dec 30",
  "Dec 31",
  "Jan 01",
  "Jan 02",
  "Jan 03",
];

module.exports = {
  topUpPackageAmount,
  roiCommissionPercentage,
  levelCommissionPerCentage,
  forbiddenDates,
  rankRewardAmount,
};
