const mongoose = require("mongoose");

const PDFSchema = new mongoose.Schema(
  {
    pdfId: { type: String, default: "PDFID" },
    pdfLink: String,
    date: { type: String, default: new Date().toDateString() },
  },
  { timestamps: true }
);

const PDFData = new mongoose.model("pdfdata", PDFSchema);

module.exports = PDFData;
