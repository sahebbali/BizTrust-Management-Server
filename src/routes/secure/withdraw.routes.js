const {
  withdrawAmount,
  withdrawHistory,
} = require("../../controller/secure/withdraw.controller");
// const {
//   withdrawAmountValidators,
// } = require("../../validation/withdraw.validator");
const router = require("express").Router();

router.post("/withdraw", withdrawAmount);
router.get("/withdraw_history", withdrawHistory);

module.exports = router;
