const mongoose = require("mongoose");

const mongoosePlugin = require("mongoose-paginate-v2");

const ThisMonthTeamBusinessSchema = new mongoose.Schema(
  {
    userId: String,
    fullName: String,
    teamBusiness: Number,
  },
  { timestamps: true }
);

ThisMonthTeamBusinessSchema.plugin(mongoosePlugin);

const ThisMonthTeamBusinessIncome = mongoose.model(
  "ThisMonthTeamBusiness",
  ThisMonthTeamBusinessSchema
);
module.exports = ThisMonthTeamBusinessIncome;
