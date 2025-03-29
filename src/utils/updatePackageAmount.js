const User = require("../models/auth.model");
const Wallet = require("../models/wallet.model");

const updatePackageAmount = async (userId, amount) => {
  try {
    console.log({ userId, amount });

    const existUser = await User.findOne({ userId });
    if (!existUser) {
      console.log("User not found");
      return;
    }

    const totalPackageAmount = (existUser.packageAmount || 0) + amount;
    const openLevel = totalPackageAmount >= 1000000 ? 5 : 2;

    const updatedUser = await User.findOneAndUpdate(
      { userId },
      { $set: { packageAmount: totalPackageAmount, openLevel } },
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
