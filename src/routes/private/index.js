const router = require("express").Router();
const { verifyJWT, verifyAdmin } = require("../../middleware/authMiddleware");
const membersRouter = require("./members.routes");
const getcontactusRouter = require("./contactus.routes");
const getdepositsRouter = require("./deposits.routes");
const getdashboardRouter = require("./dashboard.routes");
const showWithdeawRouter = require("./withdraw.routes");
const earningRouter = require("./earning.routes");
const settingRouter = require("./settings.routes");
const topupRouter = require("./topup.routes");

const middleware = [verifyJWT, verifyAdmin];
router.use(middleware);
// Members router
router.use(membersRouter);
// Contact router
router.use(getcontactusRouter);
// Deposit router
router.use(getdepositsRouter);
// Dashboard router
router.use(getdashboardRouter);
// Withdraw router
router.use(showWithdeawRouter);
// Earning router
router.use(earningRouter);
// Setting router
router.use(settingRouter);
// Topup router
router.use(topupRouter);

module.exports = router;
