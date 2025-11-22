const express = require("express");
const router = express.Router();
const multer = require("../../middleware/multer");
const {
  allMembersController,
  activeUsersController,
  blockedUsersController,
  editUser,
  changeUserStatus,
  deleteUser,
  getTeamStatistics,
  getTeamStatsDetails,
  getAllPin,
  getUpgradeTeamStatsDetails,
  getAddressHistoryByAdmin,
  createOtpForEditUserByAdminController,
  findThisMonthTotalTeamBusiness,
  getAllKYCController,
  updateKycController,
  updateUserWalletInfo,
  makePinAccount,
  updateUserOpenLevel,
  inquiredUsersController,
  addUser,
  getInquiryByEmail,
} = require("../../controller/private/members.controller");
const {
  uploadRewardImage,
  deleteRewardImage,
  getAllRewards,
} = require("../../controller/private/rewardImage.controller");
const registerValidator = require("../../validation/auth.validator");
const {
  registerController,
} = require("../../controller/public/auth.controller");

router.get(
  "/user/find_this_month_total_team_business",
  findThisMonthTotalTeamBusiness
);
router.post(
  "/user/create_otp_for_edit_member_by_admin",
  createOtpForEditUserByAdminController
);
router.get("/user/get_address_history_by_admin", getAddressHistoryByAdmin);
router.get("/user/get_all_users", allMembersController);
router.get("/user/get_active_users", activeUsersController);
router.get("/user/get_blocked_users", blockedUsersController);
router.get("/user/get_inquired_users", inquiredUsersController);
router.put("/user/edit_users", editUser);
router.put("/user/change_user_status", changeUserStatus);
router.put("/user/delete_user", deleteUser);
router.get("/user/get-all-rewards", getAllRewards);
router.post(
  "/user/upload_reward_image",
  multer.array("image", 6),
  uploadRewardImage
);
router.delete("/user/delete_reward_image", deleteRewardImage);
router.post("/user/get_team_stats", getTeamStatistics);
router.get("/user/get_team_stats_details", getTeamStatsDetails);
router.get("/user/get_upgrade_team_stats_details", getUpgradeTeamStatsDetails);

router.get("/user/get_all_pin", getAllPin);
router.get("/getAllKYCAdmin", getAllKYCController);
router.patch("/updateKycAdmin", updateKycController);
router.put("/updateUserWalletInfo", updateUserWalletInfo);
router.put("/makePinAccount", makePinAccount);
router.put("/updateUserOpenLevel", updateUserOpenLevel);

router.post("/add-user", addUser);
router.get("/get-inquiry-by-email/:email", getInquiryByEmail);

module.exports = router;
