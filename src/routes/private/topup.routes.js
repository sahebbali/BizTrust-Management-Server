const express = require("express");
const {
  getTopupHistory,
  createTopupController,
  updateTopUpStatus,
} = require("../../controller/private/topup.controller");
const router = express.Router();

router.get("/get_topup_history", getTopupHistory);
router.post("/create_sell_package", createTopupController);
router.put("/update_top_up_status", updateTopUpStatus);

module.exports = router;
