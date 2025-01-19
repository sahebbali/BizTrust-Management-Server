const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const mongoosePlugin = require("mongoose-paginate-v2");
const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "User id is required"],
    },
    fullName: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Must be at least 6 characters"],
    },
    mobile: {
      type: String,
      required: [true, "Mobile is required"],
    },
    sponsorId: {
      type: String,
      required: [true, "Sponsor ID is required"],
      maxlength: 6,
    },
    sponsorName: {
      type: String,
      required: [true, "Sponsor Name is required"],
    },
    otpCode: {
      type: String,
      required: [false, "OTP Code is required"],
    },
    token: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: Boolean,
    activationDate: String,
    joiningDate: String,
    userStatus: Boolean,
    team: [
      {
        userId: String,
        level: String,
      },
    ],
    country: String,
    gender: String,
    avatar: String,
    deleteStatus: { type: Boolean, default: false },
    packageInfo: {
      type: {
        amount: Number,
      },
    },
    rank: String,
    rankIncomeCurrentDate: Number,
    rankIncomeCurrentDateString: String,
    walletAddress: String,
    myChain: String,
  },
  { timestamps: true }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = bcrypt.hashSync(this.password, 10);
});
userSchema.plugin(mongoosePlugin);

// Define and export the User model
const User = mongoose.model("User", userSchema);
module.exports = User;
