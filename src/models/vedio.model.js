const mongoose = require("mongoose");

const VedioSchema = new mongoose.Schema(
  {
    vedioId: { type: String, unique: true },
    vedioLink: String,
    date: { type: String, default: new Date().toDateString() },
  },
  { timestamps: true }
);



const VedioData = mongoose.model("VedioData", VedioSchema);

module.exports = VedioData;
