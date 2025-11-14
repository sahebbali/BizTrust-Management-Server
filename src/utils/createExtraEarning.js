const ExtraEarning = require("../models/extraEarning");

const CreateExtraEarning = async (
  userId,
  fullName,
  incomeFrom,
  incomeFromFullName,
  level,
  amount,
  type
) => {
  try {
    // Calculate expiration time (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create a new ExtraEarning document
    const extraEarning = new ExtraEarning({
      userId,
      fullName,
      incomeFrom,
      incomeFromFullName,
      level,
      amount,
      type,
      expiresAt,
    });

    // Save to database
    const savedExtraEarning = await extraEarning.save();
  } catch (error) {
    // Handle errors
    console.error(error);
  }
};

module.exports = CreateExtraEarning;
