const ExtraEarning = require("../models/extraEarning");

const ProvideExtraEarning = async (userId) => {
  try {
    // Create a new ExtraEarning document
    const extraEarning = await ExtraEarning.find({
      userId,
    });
    console.log({ extraEarning });
    if (!extraEarning) {
      return;
    } else {
    }
  } catch (error) {
    // Handle errors
    console.error(error);
  }
};

module.exports = ProvideExtraEarning;
