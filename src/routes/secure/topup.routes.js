const { createTopupController, getTopupHistoryController } = require("../../controller/secure/topup.controller");

const router = require("express").Router();

router.post("/create_topup_by_user", createTopupController)
router.get("/get_topup_history_by_user", getTopupHistoryController)


module.exports = router