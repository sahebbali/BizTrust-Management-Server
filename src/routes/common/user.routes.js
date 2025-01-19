const router = require("express").Router();
const { getUserInfo, getPopUpImg, getPdfLink } = require("../../controller/common/user.controller");
const { verifyJWT } = require("../../middleware/authMiddleware");



router.use(verifyJWT);

router.get("/get_user", getUserInfo);
router.get("/get_popup_img", getPopUpImg);
router.get("/get_pdf_link", getPdfLink);


module.exports = router;