const mongoose = require("mongoose");
const mongoosePlugin = require("mongoose-paginate-v2");
const schema = new mongoose.Schema(
  {
    userId: String,
    kyc_method: String,
    card_number: String,
    front_side: String,
    back_side: String,
    status: {
      type: String,
      enum: ["pending", "succeed", "rejected"],
      default: "pending",
    },
    submissionDate: String,
  },
  { timestamps: true }
);
schema.plugin(mongoosePlugin);
const Kyc = new mongoose.model("kyc", schema);
module.exports = Kyc;
