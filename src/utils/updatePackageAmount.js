const User = require("../models/auth.model");

const updatePackageAmount = async (userId, amount) => {
  try {
    const existUser = await User.findOne(userId);
    const totalPackageAmount = existUser?.packageAmount + amount;

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
