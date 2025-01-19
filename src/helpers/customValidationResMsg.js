const { validationResult } = require("express-validator");
const { ValidationErrorMsg } = require("./ValidationErrorMsg");

const customValidationResMsg = async (req, res, next) => {
  const error = validationResult(req).formatWith(ValidationErrorMsg);
  if (!error.isEmpty()) {
    let msg;
    Object.keys(req.body).map((d) => {
      if (error.mapped()[d] !== undefined) {
        msg = error.mapped()[d];
      }
    });
    if (msg !== undefined) {
      return res.status(400).json({
        message: msg,
      });
    }
  }
  next()
};

// const customValidationResMsg = (req, res, next) => {
//   const errors = validationResult(req).formatWith(ValidationErrorMsg);

//   if (!errors.isEmpty()) {
//     // Extract all error messages into an array
//     const errorMessages = errors.array().map((error) => error.msg);

//     return res.status(400).json({
//       errors: errorMessages,
//     });
//   }

//   // If there are no errors, proceed to the next middleware
//   next();
// };
module.exports = customValidationResMsg 
