const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema(
  {
    avatar: String,
    avatarPublicUrl: String,
    date: String,
  },
  { timestamps: true }
);

const Image = mongoose.model("Image", ImageSchema);

module.exports = Image;
