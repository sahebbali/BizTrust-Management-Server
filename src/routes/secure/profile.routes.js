const {
  getUserInfo,
  updateUserInfo,
  changePassword,
  updateEmail,
  updateTrxAddress,
  upLoadProofPic,
  updateProfilePic,
  addPin,
  getPin,
  createOtpForTrxAddressChangeByUserController,
  getAddressHistoryByUser,
  matchCurrentEmailOtp,
  createOtpForEmailAddress,
  addUserWalletInfo,
} = require("../../controller/secure/profile.controller");

const router = require("express").Router();

router.post("/user/match_current_email_otp", matchCurrentEmailOtp);
router.post("/user/create_otp_for_email_change", createOtpForEmailAddress);
router.post(
  "/user/create_otp_for_trx_address_change_by_user",
  createOtpForTrxAddressChangeByUserController
);
router.get("/get_wallet_address_history_by_user", getAddressHistoryByUser);
router.get("/user/get_user", getUserInfo); // view profile
router.put("/user/update_user_info", updateUserInfo); // update user
router.put("/user/update_email", updateEmail); // update email
router.put("/user/change_password", changePassword); // change password
router.put("/user/update_trx_address", updateTrxAddress); // update trx address
router.put("/user/upload_profile_pic", updateProfilePic); // upload profile pic
router.post("/user/add_pin", addPin); // upload profile pic
router.get("/user/get_pin", getPin); // upload profile pic

router.post("/add_user_wallet_info", addUserWalletInfo); // upload profile pic

module.exports = router;
