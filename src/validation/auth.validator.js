const { body } = require("express-validator");
const User = require("../models/auth.model");

const registerValidator = [
  body("fullName").not().isEmpty().withMessage("Name is required").trim(),
  body("email")
    .not()
    .isEmpty()
    .withMessage("Email is required")
    // .custom(async (email) => {
    //   const emailMatch = await User.findOne({ email });
    //   if (emailMatch) {
    //     return Promise.reject("Email already in use");
    //   }
    // })
    .isEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/\d/)
    .withMessage("Password must contain a number")
    .trim(),
  body("confirmPassword")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/\d/)
    .withMessage("Password must contain a number")
    .trim(),
  body("mobile")
    .not()
    .isEmpty()
    .withMessage("Mobile number is required")
    // .isMobilePhone(['any'])
    .withMessage("Mobile number is not valid")
    .custom(async (mobile) => {
      const mobileMatch = await User.findOne({ mobile });
      // if (mobileMatch) {
      //   return Promise.reject("Mobile number already in use");
      // }
    })
    .trim(),
  body("sponsorId")
    .not()
    .isEmpty()
    .withMessage("Sponsor ID is required")
    .trim(),
  body("sponsorName")
    .not()
    .isEmpty()
    .withMessage("Sponsor Name is required")
    .trim(),
  // body("otpCode").not().isEmpty().withMessage("OTP Code is required").trim(),
  body("role")
    .not()
    .isEmpty()
    .withMessage("Role is required")
    .isIn(["user", "admin"])
    .withMessage("Role is out of role [user, admin]")
    .trim(),
];

module.exports = registerValidator;

const loginValidator = [
  body("userId").not().isEmpty().withMessage("User ID is required"),
  body("password").not().isEmpty().withMessage("Password is required"),
  body("otpCode").not().isEmpty().withMessage("OTP Code is required"),
];

const forgotPasswordValidator = [
  body("email")
    .not()
    .isEmpty()
    .withMessage("Email is required")
    .normalizeEmail()
    .isEmail()
    .withMessage("Please provide a valid email")
    .trim()
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (!user) {
        return Promise.reject("Email not found"); // You can customize this message as needed.
      }
    }),
];

const forgotPasswordValidationHandler = function (req, res, next) {
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();

  if (Object.keys(mappedErrors).length === 0) {
    // No validation errors, proceed to the next middleware or route handler.
    next();
  } else {
    // Validation errors found, send an error response.
    return res.status(400).json({
      errors: mappedErrors,
    });
  }
};

const resetPasswordValidators = [
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/[!@#$%^&*()_+{:;"'|/}]/)
    .withMessage("Password must contain at least one special character")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),
];

const resetPasswordValidationHandler = function (req, res, next) {
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();

  if (Object.keys(mappedErrors).length === 0) {
    // No validation errors, proceed to the next middleware or route handler.
    next();
  } else {
    // Validation errors found, send an error response.
    return res.status(400).json({
      errors: mappedErrors,
    });
  }
};

// contactus
const ContactUsValidator = [
  body("name").notEmpty().withMessage("Name is required"),
  body("user_id").notEmpty().withMessage("User ID is required"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email"),
  body("message").notEmpty().withMessage("Message is required"),
  body("subject").notEmpty().withMessage("Subject is required"),
  body("mobile").notEmpty().withMessage("Mobile is required"),
];

const contactusValidationHandler = function (req, res, next) {
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();
  if (Object.keys(mappedErrors).length === 0) {
    next();
  } else {
    return res.send({
      errors: mappedErrors,
    });
  }
};

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  forgotPasswordValidationHandler,
  resetPasswordValidators,
  resetPasswordValidationHandler,
  ContactUsValidator,
  contactusValidationHandler,
};
