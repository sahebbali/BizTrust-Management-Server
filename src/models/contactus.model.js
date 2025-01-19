const mongoose = require("mongoose");
const mongoosePlugin = require("mongoose-paginate-v2");

const contactUsSchema = new mongoose.Schema(
  {
    userId: { type: String, require: true },
    userName: { type: String },
    history: { type: [Object], default: [] },
    date: { type: String, default: new Date().toDateString() },
  },
  { timestamps: true }
);

contactUsSchema.plugin(mongoosePlugin);

const Contact = new mongoose.model("Contact", contactUsSchema);

module.exports = Contact;
