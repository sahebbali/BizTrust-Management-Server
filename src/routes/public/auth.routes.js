const {
  registerController,
  loginController,
  createOtpController,
  getSponsorNameController,
  ForgotPasswordController,
  resetPasswordController,
  checkMobileNumberController,
  checkEmailController,
  verifyUser,
  getPdfLink,
  getAllImage,
  getAllVedio,

  createAdminLoginOtpController,
  adminLoginController,
  createInquiry,
} = require("../../controller/public/auth.controller");
const {
  registerValidator,
  loginValidator,
} = require("../../validation/auth.validator");

const router = require("express").Router();

router.post("/register", registerValidator, registerController);
router.post("/admin_login", adminLoginController);
router.post("/login", loginValidator, loginController);
router.put("/verify_user/:token", verifyUser);
router.post("/create_admin_login_otp", createAdminLoginOtpController);
router.post("/create_otp", createOtpController);
router.get("/get_sponsor/:userId", getSponsorNameController);
router.post("/forgot_password", ForgotPasswordController);
router.post("/reset_password/:token", resetPasswordController);
router.get("/check_mobile/:mobile", checkMobileNumberController);
router.get("/check_email/:email", checkEmailController);
router.get("/get_pdf_link", getPdfLink);
router.get("/get_all_image", getAllImage);
router.get("/get_all_vedio", getAllVedio);
router.post("/create_inquiry", createInquiry);

module.exports = router;
