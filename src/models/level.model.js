const mongoose = require("mongoose");
const mongoosePlugin = require("mongoose-paginate-v2");

const levelSchema = new mongoose.Schema(
  {
    userId: String,
    fullName: String,
    email: String,
    sponsorId: String,
    sponsorName: String,
    level: [
      new mongoose.Schema({
        level: String,
        userId: String,
        fullName: String,
        mobile: String,
        email: String,
        sponsorId: String,
        sponsorName: String,
        joiningDate: String,
        activationDate: String,
      }),
    ],
  },
  { timestamps: true }
);

levelSchema.plugin(mongoosePlugin);

const Level = new mongoose.model("Level", levelSchema);

module.exports = Level;
