const express = require("express");
const {
  getAllLevelIncomeController,
  getRoiIncomeController,
  getRankIncomeController,
  getBonusIncomeController,
  getAllProfitSharingIncomeController,
} = require("../../controller/private/earning.controller");
const router = express.Router();

router.get("/get_level_income", getAllLevelIncomeController);
router.get("/get_roi_income", getRoiIncomeController);
router.get("/get_rank_income", getRankIncomeController);
router.get("/get_rank_bonus_income", getBonusIncomeController);
router.get("/get_profit_sharing_income", getAllProfitSharingIncomeController);

module.exports = router;
