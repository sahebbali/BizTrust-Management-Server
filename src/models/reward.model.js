const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema(
  {
    image: {
      url: String,
      publicId: String,
    },
  },
  { timestamps: true }
);

const Reward = mongoose.model("Reward", rewardSchema);

module.exports = { Reward };
