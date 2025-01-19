const mongoose = require("mongoose");
const mongoosePlugin = require("mongoose-paginate-v2");

const updateSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    date: { type: String, default: new Date().toDateString() },
  },
  { timestamps: true }
);

updateSchema.plugin(mongoosePlugin);

const Update = new mongoose.model("Update", updateSchema);

module.exports = Update;
