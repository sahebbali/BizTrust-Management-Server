const mongoose = require("mongoose");
const mongoosePlugin = require("mongoose-paginate-v2");

const ManageLevelIncomeSchema = new mongoose.Schema(
  {
    level: { type: Number, require: true, unique: true },
    percentage: { type: Number, require: true },
    type: { type: Number, require: true },
  },
  { timestamps: true }
);

ManageLevelIncomeSchema.plugin(mongoosePlugin);

const ManageLevelIncome = new mongoose.model(
  "Manage-Level-Income",
  ManageLevelIncomeSchema
);

module.exports = ManageLevelIncome;
