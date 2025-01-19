const mongoose = require("mongoose");
const mongoosePlugin = require("mongoose-paginate-v2");

const withdrawSchema = new mongoose.Schema(
  {
    userId: { type: String, require: true },
    fullName: String,
    sponsorId: { type: String },
    sponsorName: String,
    requestAmount: Number,
    withdrawCharge: Number,
    amountAfterCharge: Number,
    currentAmount: Number,
    trxAddress: String,
    status: {
      type: String,
      enum: ["pending", "success", "rejected"],
      default: "pending",
    },
    transactionId: String,
    transactionHash: String,
    withdrawType: { type: String, enum: ["investment", "profit"] },
    date: { type: String, default: new Date().toDateString() },
    time: String,
    myChain: String,
  },
  { timestamps: true }
);

withdrawSchema.plugin(mongoosePlugin);

const Withdraw = new mongoose.model("Withdraw", withdrawSchema);

module.exports = Withdraw;
