const { getRewardController } = require("../../controller/secure/reward.controller");


const router = require("express").Router();

router.get("/get_reward", getRewardController);

module.exports = router;