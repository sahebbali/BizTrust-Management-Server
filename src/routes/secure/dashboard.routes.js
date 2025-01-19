
const router = require("express").Router();
const { getDashboardStatsController } = require("../../controller/secure/dashboard.controller");

router.get("/get_dashboardStats_by_user", getDashboardStatsController)

module.exports = router;
