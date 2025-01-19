const mongoose = require("mongoose");
const mongoosePlugin = require("mongoose-paginate-v2");

const ManageDepositHistorySchema = new mongoose.Schema(
  {
    userId: { type: String, require: true },
    fullName: { type: String, require: true },
    priviesDepositBalance: Number,
    minusAmount: Number,
    plusAmount: Number,
    currentDeposit: Number,
    date: { type: String },
    time: String,
  },
  { timestamps: true }
);

ManageDepositHistorySchema.plugin(mongoosePlugin);

const ManageDepositHistory = new mongoose.model(
  "ManageDepositHistory",
  ManageDepositHistorySchema
);

module.exports = ManageDepositHistory;
