const mongoose = require("mongoose");

const mongoosePlugin = require("mongoose-paginate-v2");

const thisMonthTeamBusinessHistorySchema = new mongoose.Schema(
  {
    parentUserId: String,
    userId: String,
    fullName: String,
    level: Number,
    packageAmount: Number,
    date: String,
    time: String,
  },
  { timestamps: true }
);

thisMonthTeamBusinessHistorySchema.plugin(mongoosePlugin);

const ThisMonthTeamBusinessHistory = mongoose.model(
  "ThisMonthTeamBusinessHistory",
  thisMonthTeamBusinessHistorySchema
);
module.exports = { ThisMonthTeamBusinessHistory };
