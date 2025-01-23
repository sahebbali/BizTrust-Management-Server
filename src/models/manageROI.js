const mongoose = require("mongoose");
const mongoosePlugin = require("mongoose-paginate-v2");

const ManageROIHistorySchema = new mongoose.Schema(
  {
    date: { type: String, require: true, unique: true },
    percentage: { type: Number, require: true },
  },
  { timestamps: true }
);

ManageROIHistorySchema.plugin(mongoosePlugin);

const ManageROIHistory = new mongoose.model(
  "Manage-ROI",
  ManageROIHistorySchema
);

module.exports = ManageROIHistory;
