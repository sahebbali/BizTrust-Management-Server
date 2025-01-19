const { check } = require("express-validator");

// contactus
const contactusValidators = [
  check("name").notEmpty().withMessage("name is required"),
  check("email").notEmpty().withMessage("email is required"),
  check("user_id").notEmpty().withMessage("User ID is required"),
  check("message").notEmpty().withMessage("message is required"),
];

module.exports = { contactusValidators };
