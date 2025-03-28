const {
  changePassword,
  updateEmail,
  changePdfLink,
  createImage,
  getImages,
  deleteImage,
  createVedio,
  getVedio,
  deleteVedio,
  createPopUpImage,
  createManageROI,
  getAllManageROI,
  deleteManageROI,
  editManageROI,
  createManageLevelIncome,
  getAllManageLevelIncome,
  deleteManageLevelIncome,
  editManageLevelIncome,
  addSystemWalletInfo,
  getAllSystemWallet,
  deleteSystemWallet,
  editSystemWallet,
} = require("../../controller/private/setting.controller");
const { createNews } = require("../../controller/private/support.controller");
const multer = require("../../middleware/multer");

const router = require("express").Router();

router.put("/change_password", changePassword);
router.put("/update_email", updateEmail);
router.post("/change_pdf_link", changePdfLink);
router.post("/create_news", createNews);
router.post("/create_image", multer.single("image"), createImage);
router.post("/change_popup_img", multer.single("image"), createPopUpImage);
// router.post("/create_image",  createImage);
router.get("/get_all_image", getImages);
router.delete("/delete_image_byId", deleteImage);
router.post("/create_vedio", createVedio);
router.get("/get_all_vedio", getVedio);
router.delete("/delete_vedio_byId", deleteVedio);

router.post("/create-manage-roi", createManageROI);
router.get("/get-manage-roi", getAllManageROI);
router.delete("/delete-manage-roi", deleteManageROI);
router.put("/edit-manage-roi", editManageROI);

router.post("/create-manage-level-income", createManageLevelIncome);
router.get("/get-manage-level-income", getAllManageLevelIncome);
router.delete("/delete-manage-level-income", deleteManageLevelIncome);
router.put("/edit-manage-level-income", editManageLevelIncome);

router.post("/add-system-wallet-info", addSystemWalletInfo);
router.get("/get-system-wallet-info", getAllSystemWallet);
router.delete("/delete-system-wallet-info", deleteSystemWallet);
router.put("/edit-system-wallet-info", editSystemWallet);

module.exports = router;
