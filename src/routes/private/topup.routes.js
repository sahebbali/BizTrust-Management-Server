const express = require("express");
const {
  getTopupHistory,
  createTopupController,
} = require("../../controller/private/topup.controller");
const router = express.Router();

router.get("/get_topup_history", getTopupHistory);
router.post("/create_sell_package", createTopupController);

module.exports = router;
