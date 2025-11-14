const ExtraEarning = require("../models/extraEarning");
const { UpdateWallet } = require("./CheckUserEarningLimit");
const CreateLevelIncomeHistory = require("./createLevelIncomeHistory");

const ProvideExtraEarning = async (userId) => {
  try {
    // Create a new ExtraEarning document
    const extraEarning = await ExtraEarning.find({
      userId,
    });
    // console.log({ extraEarning });
    if (!extraEarning) {
      return;
    } else {
      for (extra of extraEarning) {
        console.log(extra.amount);
        await CreateLevelIncomeHistory(
          extra.userId,
          extra.fullName,
          extra.incomeFrom,
          extra.incomeFromFullName,
          extra.levelUserPackageInfoAmount,
          extra.level,
          extra.amount,
          extra.type
        );
        await UpdateWallet(extra.userId, extra.amount, extra.type);
        await ExtraEarning.deleteMany({ userId });
      }
    }
  } catch (error) {
    // Handle errors
    console.error(error);
  }
};

module.exports = ProvideExtraEarning;
