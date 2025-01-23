const router = require("express").Router();
const {
  getLevelIncome,
  getRoiIncome,
  getRankIncome,
  getBonusIncome,
  getDailyIncome,
  getProfitSharingIncome,
} = require("../../controller/secure/earning.controller");

router.get("/get_level_income", getLevelIncome);
router.get("/get_roi_income", getRoiIncome);
router.get("/get_rank_income", getRankIncome);
router.get("/get_bonus_income", getBonusIncome);
router.get("/get_daily_income", getDailyIncome);
router.get("/get_profit_sharing_income", getProfitSharingIncome);

module.exports = router;
