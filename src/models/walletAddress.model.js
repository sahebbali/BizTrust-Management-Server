const mongoose = require("mongoose");
const mongoosePlugin = require("mongoose-paginate-v2");

const walletAddressSchema = new mongoose.Schema(
  {
    userId: { type: String, require: true },
    fullName: { type: String, require: true },
    bankName: { type: String, require: true },
    accountTitle: { type: String, require: true },
    accountNoIBAN: { type: String, require: true },
    branchCode: { type: String, require: true },
    date: { type: String, require: true },
    time: { type: String, require: true },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

walletAddressSchema.plugin(mongoosePlugin);

const WalletAddress = new mongoose.model("WalletAddress", walletAddressSchema);

module.exports = WalletAddress;
