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
    bankName: { type: String, require: true },
    accountTitle: { type: String, require: true },
    accountNoIBAN: { type: String, require: true },
    branchCode: { type: String, require: true },
    status: {
      type: String,
      enum: ["pending", "success", "rejected"],
      default: "pending",
    },
    transactionId: String,
    transactionHash: String,
    withdrawType: { type: String, enum: ["E-wallet", "Profit Wallet", "Both"] },
    date: { type: String, default: new Date().toDateString() },
    time: String,
    myChain: String,
  },
  { timestamps: true }
);

withdrawSchema.plugin(mongoosePlugin);

const Withdraw = new mongoose.model("Withdraw", withdrawSchema);

module.exports = Withdraw;
