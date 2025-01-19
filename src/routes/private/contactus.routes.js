const express = require("express");
const getAllContactUsHistory = require("../../controller/private/contactus.controller");
const {
  getAllSupportHistory,
  createNews,
  sentResponse,
} = require("../../controller/private/support.controller");
const router = express.Router();

router.get("/get_all_contactus", getAllContactUsHistory);
router.get("/get_all_support", getAllSupportHistory);
router.post("/create_news", createNews);
router.post("/send_response", sentResponse);

module.exports = router;
