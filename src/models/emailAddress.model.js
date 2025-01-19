const mongoose = require("mongoose");
const mongoosePlugin = require("mongoose-paginate-v2");

const emailAddressSchema = new mongoose.Schema(
  {
    userId: { type: String, require: true },
    fullName: { type: String, require: true },
    previousAddress: { type: String, require: true },
    currentAddress: { type: String, require: true },
    updatedBy: { type: String, require: true },
    date: { type: String, require: true },
    time: { type: String, require: true },
  },
  { timestamps: true }
);

emailAddressSchema.plugin(mongoosePlugin);

const EmailAddress = new mongoose.model("EmailAddress", emailAddressSchema);

module.exports = EmailAddress;
