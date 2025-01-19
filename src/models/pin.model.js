const mongoose = require("mongoose");
const mongoosePlugin = require("mongoose-paginate-v2");

const pinSchema = new mongoose.Schema(
  {
    userId: String,
    fullName: String,
    new_pin: {
      type: String,
      required: true,
      minlength: 6,
    },
    confirm_new_pin: {
      type: String,
      required: true,
      minlength: 6,
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

pinSchema.plugin(mongoosePlugin);

const Pin = mongoose.model("Pin", pinSchema);

module.exports = Pin;
