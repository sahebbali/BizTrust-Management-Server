const mongoose = require("mongoose");

// Define the schema
const createNewsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
}, {
  timestamps: true // This enables automatic timestamps
});

// Create the model
const createNews = mongoose.model("CreateNews", createNewsSchema);

module.exports = createNews;
