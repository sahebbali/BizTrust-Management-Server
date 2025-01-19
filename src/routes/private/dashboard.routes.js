const express = require("express");
const {
  getAdminDashboardStatsController,
  runROIStaticController,
} = require("../../controller/private/dashboard.controller");
// const levelIncome = require("../../utils/levelIncome");
// const { rankIncome } = require("../../utils/rankIncome");
const router = express.Router();

router.get("/get_admin_dashboard_data", getAdminDashboardStatsController);

router.patch("/run-roi", runROIStaticController);

module.exports = router;
