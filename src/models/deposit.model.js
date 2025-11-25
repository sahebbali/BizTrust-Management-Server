const mongoose = require("mongoose");
const mongoosePlugin = require("mongoose-paginate-v2");

const depositSchema = new mongoose.Schema(
  {
    userId: String,
    name: String,
    amount: Number,
    bankName: String,
    securityType: String,
    status: String,
    date: String,
    time: String,
    transactionId: String,
    hash: String,
    remark: String,
    proofPic: {},
  },
  { timestamps: true }
);

depositSchema.plugin(mongoosePlugin);

const Deposit = new mongoose.model("Deposit", depositSchema);

module.exports = Deposit;
