const mongoose = require("mongoose");

const mongoosePlugin = require("mongoose-paginate-v2");

const packageBuyInfoSchema = new mongoose.Schema(
  {
    userId: String,
    userFullName: String,
    sponsorId: String,
    sponsorName: String,
    packageId: { type: String, required: true },
    packageAmount: {
      type: Number,
      require: true,
    },
    isActive: { type: Boolean, default: true },
    isComplect: { type: Boolean, default: false },
    isMondayCheck: Boolean,
    incomeDay: {
      type: Number,
      default: 0,
      required: true,
    },
    totalReturnedAmount: {
      type: Number,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    startDateInt: {
      type: Number,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    endDateInt: {
      type: Number,
      required: true,
    },
    packageType: String,
    date: String,
    time: String,
    upgradedAmount: Number,
  },
  { timestamps: true }
);

packageBuyInfoSchema.plugin(mongoosePlugin);

const PackageBuyInfo = mongoose.model("PackageBuyInfo", packageBuyInfoSchema);

const packageRoiSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    sponsorId: {
      type: String,
      required: true,
    },
    sponsorName: String,
    packageId: { type: String, required: true },
    currentPackage: {
      type: Number,
      required: true,
    },
    previousPackage: [
      {
        amount: Number,
        startDate: String,
        endDate: String,
      },
    ],
    isActive: Boolean,
    isMondayCheck: Boolean,
    incomeDay: {
      type: Number,
      required: true,
    },
    totalReturnedAmount: {
      type: Number,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    history: [
      {
        userId: { type: String, required: true },
        fullName: { type: String, required: true },
        package: { type: Number, required: true },
        commissionPercentagePerDay: { type: Number, required: true },
        commissionAmount: { type: Number, required: true },
        totalCommissionAmount: { type: Number, required: true },
        incomeDay: { type: Number, required: true },
        incomeDate: { type: String, required: true },
        incomeTime: { type: String, required: true },
        incomeDateInt: { type: Number, required: true },
        transactionId: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

packageRoiSchema.plugin(mongoosePlugin);

const PackageRoi = mongoose.model("PackageRoi", packageRoiSchema);

module.exports = {
  PackageBuyInfo,
  PackageRoi,
};
