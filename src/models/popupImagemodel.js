const mongoose = require("mongoose");

const popupImageSchema = new mongoose.Schema(
  {
    image_id: {type: String, default: "TLCPOPUPIMAGE"},
    avatar: String,
    avatar_public_url: String,
    date: { type: String, default: new Date().toDateString() },
  },
  { timestamps: true }
);

const PopupImage = new mongoose.model("PopupImage", popupImageSchema);

module.exports = PopupImage;