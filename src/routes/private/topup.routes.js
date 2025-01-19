const express = require("express");
const {
  getTopupHistory,
} = require("../../controller/private/topup.controller");
const router = express.Router();

router.get("/get_topup_history", getTopupHistory);

module.exports = router;
