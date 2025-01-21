const mongoose = require("mongoose");
const mongoosePlugin = require("mongoose-paginate-v2");

const levelIncomeSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    incomeFrom: {
      type: String,
      required: true,
    },
    incomeFromFullName: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    levelUserPackageInfoAmount: {
      type: Number,
      required: true,
    },
    selfPackageInfoAmount: {
      type: Number,
      required: true,
    },
    transactionID: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);
levelIncomeSchema.plugin(mongoosePlugin);

const LevelIncome = mongoose.model("LevelIncome", levelIncomeSchema);

module.exports = LevelIncome;
