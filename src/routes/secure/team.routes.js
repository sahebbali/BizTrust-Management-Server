const {
  getLevelTeam,
  getDirectLevelTeam,
  getLevelBusiness,
} = require("../../controller/secure/team.xcontroller");

const router = require("express").Router();

router.get("/get_level_team", getLevelTeam);
router.get("/get_direct_team", getDirectLevelTeam);
router.get("/get_level_business", getLevelBusiness);

module.exports = router;
