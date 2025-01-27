const { check } = require("express-validator");
const User = require("../models/auth.model");
const Wallet = require("../models/wallet.model");

// withdrawAmount
// const withdrawAmountValidators = [
//   check("amount")
//     .notEmpty()
//     .withMessage("Amount is required")

//   check("trx_address")
//     .notEmpty()
//     .withMessage("Wallet address is required")
//     .custom(async (trx_address, { req }) => {
//       const user = await User.findOne({ userId: req.auth.id });
//       if (user.walletAddress !== trx_address) {
//         return Promise.reject("Wallet address is invalid");
//       }
//       if (!trx_address.startsWith("0x")) {
//         return Promise.reject("Kindly add your USDT address (BEP20 Chain)");
//       }
//     })
//     .trim(),
//   check("myChain")
//     .notEmpty()
//     .withMessage("Chain is required")
//     .custom(async (myChain, { req }) => {
//       const user = await User.findOne({ userId: req.auth.id });
//       if (user?.myChain !== myChain) {
//         return Promise.reject("Chain is invalid");
//       }
//     })
//     .trim(),
//   check("withdrawType")
//     .notEmpty()
//     .withMessage("Withdraw type is required")
//     .isIn(["Profit Wallet", "E-Wallet","Both"])
//     .withMessage("Invalid withdraw type")
//     .trim(),
// ];

module.exports = {
  withdrawAmountValidators,
};
