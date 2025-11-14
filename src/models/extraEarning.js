const mongoose = require("mongoose");

const ExtraEarningSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    fullName: { type: String, required: true },
    incomeFrom: {
      type: String,
    },
    incomeFromFullName: {
      type: String,
    },
    level: {
      type: String,
    },
    amount: { type: Number, required: true },
    type: { type: String, required: true },
    expiresAt: { type: Date, required: true }, // Field to store expiration time
  },
  { timestamps: true }
);

// Set TTL index to expire documents 24 hours after `expiresAt`
ExtraEarningSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Automatically set the `expiresAt` field to 24 hours from now before saving
ExtraEarningSchema.pre("save", function (next) {
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 24 hours from now
  }
  next();
});

const ExtraEarning = mongoose.model("extra-earning", ExtraEarningSchema);

module.exports = ExtraEarning;
