const router = require("express").Router();

const { verifyJWT, verifyUser } = require("../../middleware/authMiddleware");
const topupRouter = require("./topup.routes");
const profileRouter = require("./profile.routes");
const walletRouter = require("./wallet.routes");
const withdrawRouter = require("./withdraw.routes");
const teamRouter = require("./team.routes");
const supportRouter = require("./supports.routes");
const ticketHistoryRouter = require("./tickethistory.routes");
const contactusRouter = require("./contactus.routes");
const dashboardRouter = require("./dashboard.routes");
const earningRouter = require("./earning.routes");
const rewardRouter = require("./reward.routes");

const middleware = [verifyJWT, verifyUser];
router.use(middleware);
// Topup Router
router.use(topupRouter);
//profile router
router.use(profileRouter);
//wallet router
router.use(walletRouter);
//withdraw router
router.use(withdrawRouter);
//team router
router.use(teamRouter);
//support router
router.use(supportRouter);
//ticket history router
router.use(ticketHistoryRouter);
//contactus router
router.use(contactusRouter);
// dashboard routers
router.use(dashboardRouter)
// Earning routers
router.use(earningRouter)
// Reward routers
router.use(rewardRouter)

module.exports = router;
