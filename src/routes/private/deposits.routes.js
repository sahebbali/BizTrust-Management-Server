const express = require("express");
const {
  showAllDeposits,
  showSuccessDeposits,
  showRejectedDeposits,
  updateDepositStatus,
  getAllManageDeposits,
  updateManageDepositAmount,
  getAllManageDepositHistory,
  createManageDepositAuth,
  loginManageDepositAuth,
  updateRemark,
} = require("../../controller/private/deposits.controller");
const router = express.Router();

router.put("/update_deposit_remark", updateRemark);
router.get("/get_all_deposits", showAllDeposits);
router.get("/get_success_deposits", showSuccessDeposits);
router.get("/get_rejected_deposits", showRejectedDeposits);
router.put("/update_deposit_status", updateDepositStatus);
router.get("/get_manage_deposit", getAllManageDeposits);
router.put("/update_manage_deposit_Amount", updateManageDepositAmount);
router.get("/get_all_manage_deposit_history", getAllManageDepositHistory);
router.post("/create_Manage_Deposit_Auth", createManageDepositAuth);
router.post("/login_Manage_Deposit_Auth", loginManageDepositAuth);

module.exports = router;
