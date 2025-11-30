// models/inquire.model.js
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const inquireSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sponsorId: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (v) => /^\+?[0-9\-()\s]{7,25}$/.test(v),
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (v) =>
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/.test(
            v
          ),
        message: (props) => `${props.value} is not a valid email!`,
      },
      // index: true,
    },
    country: { type: String, trim: true },
    city: { type: String, trim: true },
    // investmentType: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    contactDate: { type: Date, default: Date.now }, // store as Date (better)
    handled: { type: Boolean, default: false }, // example extra field
    source: {
      type: String,
      enum: ["website", "email", "phone", "other"],
      default: "website",
    },
  },
  { timestamps: true }
);

inquireSchema.plugin(mongoosePaginate);

const Inquire = mongoose.model("Inquire", inquireSchema);

module.exports = Inquire;
