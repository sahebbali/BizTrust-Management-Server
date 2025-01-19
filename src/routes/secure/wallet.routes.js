const {
  depositeAmount,
  depositeHistory,
  getMyWallet,
  checkHash,
} = require("../../controller/secure/wallet.controller");
const multer = require("../../middleware/multer");
const router = require("express").Router();

router.post("/wallet/deposit", multer.single("image"), depositeAmount);
router.get("/wallet/deposit_history", depositeHistory);
router.get("/wallet/get_wallet", getMyWallet);
router.get("/wallet/check_hash", checkHash);

module.exports = router;
