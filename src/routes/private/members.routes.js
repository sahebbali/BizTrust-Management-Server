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
} = require("../../controller/private/members.controller");
const {
  uploadRewardImage,
  deleteRewardImage,
  getAllRewards,
} = require("../../controller/private/rewardImage.controller");

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

module.exports = router;
