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

module.exports = router;
