const multer = require("../../middleware/multer");
const {
  getUpdates,
  createSupportTicket,
  getSupportHistory,
} = require("../../controller/secure/support.controller");

const router = require("express").Router();

router.get("/get_all_news", getUpdates);
router.post("/create_support", multer.single("image"), createSupportTicket);
router.get("/get_support_history", getSupportHistory);

module.exports = router;
