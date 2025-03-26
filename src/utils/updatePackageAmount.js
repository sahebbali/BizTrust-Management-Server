const User = require("../models/auth.model");

const updatePackageAmount = async (userId, amount) => {
  console.log({ amount, userId });
  try {
    const existUser = await User.findOne({ userId });
    const totalPackageAmount = existUser?.packageAmount || 0 + amount;
    console.log({ totalPackageAmount });
    await User.findOneAndUpdate(
      { userId },
      {
        $set: {
          packageAmount: totalPackageAmount,
          openLevel: totalPackageAmount >= 1000000 ? 5 : 2,
        },
      },
      { new: true }
    );
  } catch (error) {
    console.log("error update package amount", error);
  }
};

module.exports = { updatePackageAmount };
