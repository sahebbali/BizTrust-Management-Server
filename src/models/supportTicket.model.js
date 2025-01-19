const mongoose = require("mongoose");
const mongoosePlugin = require("mongoose-paginate-v2");

const supportTicketSchema = new mongoose.Schema(
  {
    userId: { type: String, require: true },
    userName: { type: String },
    history: { type: [Object], default: [] },
    date: { type: String, default: new Date().toDateString() },
  },
  { timestamps: true }
);

supportTicketSchema.plugin(mongoosePlugin);

const SupportTicket = new mongoose.model("SupportTicket", supportTicketSchema);

module.exports = SupportTicket;
