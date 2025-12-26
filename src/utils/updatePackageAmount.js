const User = require("../models/auth.model");
const Wallet = require("../models/wallet.model");

const updatePackageAmount = async (userId, amount, type) => {
  try {
    console.log({ userId, amount, type });
    const percentage = type === "Equity Fund" ? 3 : 2;

    const existUser = await User.findOne({ userId });
    if (!existUser) {
      console.log("User not found");
      return;
    }

    const totalPackageAmount = (existUser.packageAmount || 0) + amount;
    const openLevel = totalPackageAmount >= 1000000 ? 5 : 5;
    const packageLimit = amount * percentage;
    console.log({ totalPackageAmount, openLevel, packageLimit });

    const updatedUser = await User.findOneAndUpdate(
      { userId },
      {
        $set: { packageAmount: totalPackageAmount, openLevel },
        $inc: { packageLimit: packageLimit },
      },

      { new: true }
    );
    await Wallet.findOneAndUpdate(
      { userId },
      { $inc: { investmentAmount: +amount } },
      { new: true }
    );

    console.log("Updated user:", updatedUser);
    return updatedUser;
  } catch (error) {
    console.error("Error updating package amount:", error);
    throw error;
  }
};

module.exports = { updatePackageAmount };
