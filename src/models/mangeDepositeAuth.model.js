const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const mongoosePlugin = require("mongoose-paginate-v2");
const manageDepositAuthSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "User id is required"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Must be at least 6 characters"],
    },

    role: {
      type: String,
      default: "admin",
    },
  },
  { timestamps: true }
);

// Define and export the User model
const ManageDepositAuth = mongoose.model(
  "ManageDepositAuth",
  manageDepositAuthSchema
);
module.exports = ManageDepositAuth;
