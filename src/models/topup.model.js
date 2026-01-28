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
    packageLimit: {
      type: Number,
      require: true,
    },
    isActive: { type: Boolean, default: false },
    isComplect: { type: Boolean, default: false },
    isExpired: { type: Boolean, default: false },
    isFirstROI: { type: Boolean, default: true },
    isROIFree: { type: Boolean, default: false },
    isAdmin: Boolean,
    isMondayCheck: Boolean,
    incomeDay: {
      type: Number,
      default: 0,
      required: true,
    },
    totalReturnedAmount: {
      type: Number,
      default: 0,
      required: true,
    },
    startDate: {
      type: String,
    },
    startDateInt: {
      type: Number,
    },
    endDate: {
      type: String,
    },
    endDateInt: {
      type: Number,
    },
    packageType: String,
    date: String,
    time: String,
    upgradedAmount: Number,
    status: {
      type: String,
      enum: ["pending", "success", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

packageBuyInfoSchema.plugin(mongoosePlugin);

const PackageBuyInfo = mongoose.model("PackageBuyInfo", packageBuyInfoSchema);

const packageRoiSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    fullName: { type: String, required: true },
    package: { type: Number, required: true },
    commissionPercentage: { type: Number, required: true },
    commissionAmount: { type: Number, required: true },
    // totalCommissionAmount: { type: Number, required: true },
    incomeDay: { type: Number, required: true },
    incomeDate: { type: String, required: true },
    incomeTime: { type: String, required: true },
    incomeDateInt: { type: Number, required: true },
    transactionId: { type: String, required: true },
  },
  { timestamps: true },
);

packageRoiSchema.plugin(mongoosePlugin);

const PackageRoi = mongoose.model("PackageRoi", packageRoiSchema);

module.exports = {
  PackageBuyInfo,
  PackageRoi,
};
