const express = require("express");
const {
  getAdminBNBBalance,
  getAdminUSDTBalance,
  sendToken,
  getAdminbalance,
} = require("../../controller/paymentController");
const { verifyJWT, verifyAdmin } = require("../../middleware/authMiddleware");
const router = express.Router();

const middleware = [verifyJWT, verifyAdmin];
// router.use(middleware);

router.get("/get_admin_bnb_balance", getAdminBNBBalance);
router.get("/get_admin_usdt_balance", getAdminUSDTBalance);
router.get("/get_admin_balance", getAdminbalance);
router.post("/send_token", sendToken);

// STEP 1  : Store in DB  : USER ID , TIMSTAMP, WALLET ADDRESS, AMOUNT
// STEP 2 : CHECK CONDITIONS

/// i) CHeck if amount < /get_admin_usdt_balance  "ADMIN_INSUFFICIENT_BALANCE"
/// i) CHeck if /get_admin_bnb_balance > 0.001

/// STEP 3 :: ENABLE LIVE FRONTEND DEMO

module.exports = router;
