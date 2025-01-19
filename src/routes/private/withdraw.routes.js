const express = require("express");
const {
  showAllWithdraw,
  getSuccessfulWithdraws,
  getRejectedWithdraws,
  updateWithdrawStatus,
  updateWithdrawAllStatus,
  updateWithdrawAllStatusReject,
} = require("../../controller/private/withdraw.controller");
const {
  uploadRewardImage,
} = require("../../controller/private/rewardImage.controller");
const router = express.Router();

router.get("/show_all_withdraw", showAllWithdraw);
router.get("/get_success_withdraw", getSuccessfulWithdraws);
router.get("/get_rejected_withdraw", getRejectedWithdraws);
router.put("/update_withdraw_status", updateWithdrawStatus);
router.put("/upload_reward_image", uploadRewardImage);
router.put("/update_withdraw_all_status", updateWithdrawAllStatus);
router.put("/update_withdraw_all_status_reject", updateWithdrawAllStatusReject);

module.exports = router;
