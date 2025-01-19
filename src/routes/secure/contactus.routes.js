const { createContactUs, getContactUsHistory } = require("../../controller/secure/contuctus.controller");
const { contactusValidators } = require("../../validation/contactus.validation");

const router = require("express").Router();

router.post("/contactus_message", contactusValidators, createContactUs);
router.get("/get_contactus_history", getContactUsHistory);

module.exports = router;
