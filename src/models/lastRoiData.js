const mongoose = require("mongoose");

const lastRoiDataSchema = new mongoose.Schema(
  {
    date: String,
  },
  { timestamps: true }
);

const LastRoiData = new mongoose.model("lastRoiData", lastRoiDataSchema);

module.exports = LastRoiData;
