const getDatesInRange = require("../../config/getDatesInRange");
const LevelIncome = require("../../models/levelIncome.model");
const { RankIncome } = require("../../models/rankIncome.model");
const RewardIncomeModel = require("../../models/rewardIncome.model");
const { PackageRoi } = require("../../models/topup.model");

const getLevelIncome = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const downloadCSV = req.query.csv || "";

    const queryFilter = { userId: req.auth.id, type: "level-income" };

    const options = {
      page: page,
      limit: limit,
      sort: { createdAt: -1 },
    };

    const [totalLevelIncome] = await LevelIncome.aggregate([
      {
        $match: { userId: req.auth.id, type: "level-income" },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalLevelIncome: { $sum: "$amount" },
        },
      },
    ]);

    const [dynamicTotalLevelIncome] = await LevelIncome.aggregate([
      {
        $match: queryFilter,
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          dynamicTotalLevelIncome: { $sum: "$amount" },
        },
      },
    ]);

    const incomes = await LevelIncome.paginate(queryFilter, options);
    if (downloadCSV) {
      const csvData = await LevelIncome.find(queryFilter).select(
        "-_id -type -transactionID -createdAt -updatedAt -__v"
      );
      return res.status(200).json({ csv: csvData, data: incomes });
    }

    if (totalLevelIncome) {
      incomes.totalLevelIncome = totalLevelIncome.totalLevelIncome;
    }
    if (dynamicTotalLevelIncome) {
      incomes.dynamicTotalLevelIncome =
        dynamicTotalLevelIncome.dynamicTotalLevelIncome;
    }

    return res.status(200).json({ data: incomes });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Something went wrong" });
  }
};
// Get ROI income
const getRoiIncome = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const downloadCSV = req.query.csv || "";

    const histories = await PackageRoi.aggregate([
      {
        $match: {
          userId: req.auth.id,
        },
      },

      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);

    const totalHistoryPipleine = [
      {
        $match: {
          userId: req.auth.id,
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ];

    const totalHistories = await PackageRoi.aggregate(totalHistoryPipleine);

    const totalItems = totalHistories.length > 0 ? totalHistories[0].count : 0;
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const nextPage = hasNextPage ? page + 1 : null;

    const response = {
      totalDocs: totalItems,
      limit: limit,
      totalPages: totalPages,
      page: page,
      pagingCounter: page,
      hasPrevPage: page > 1,
      hasNextPage: hasNextPage,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: nextPage,
      data: histories,
    };
    // Download CSV
    if (downloadCSV === "csv") {
      const result = await PackageRoi.aggregate([
        {
          $match: {
            userId: req.auth.id,
          },
        },
        {
          $project: {
            __v: 0,
            _id: 0,
            incomeDateInt: 0,
            transactionId: 0,
            createdAt: 0,
            updatedAt: 0,
          },
        },
      ]);
      return res.status(200).json({ csv: result, data: response });
    }
    if (totalHistories.length > 0) {
      return res.status(200).json({
        message: "Retrieved the ROI income history",
        data: response,
      });
    } else {
      return res.status(400).json({ message: "ROI Income history is empty" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Something went wrong" });
  }
};
// Get Rank income
const getRankIncome = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const queryFilter = { userId: req.auth.id };

    const options = {
      page: page,
      limit: limit,
      sort: { createdAt: -1 }, // Sorting by _id in descending order
      select: "-bonusAmount",
    };

    const rankHistory = await RewardIncomeModel.paginate(queryFilter, options);

    if (rankHistory?.docs?.length > 0) {
      return res.status(200).json({ data: rankHistory });
    } else {
      return res.status(400).json({ message: "There is no Rank history" });
    }
  } catch (error) {
    console.log({ error });
    return res.status(400).json({ message: "Something went wrong" });
  }
};
const getBonusIncome = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const queryFilter = { userId: req.auth.id, bonusAmount: { $gt: 0 } };

    const options = {
      page: page,
      limit: limit,
      sort: { createdAt: -1 }, // Sorting by _id in descending order
      select: "-rewardAmount",
    };

    const bonusHistory = await RankIncome.paginate(queryFilter, options);

    if (bonusHistory?.docs?.length > 0) {
      return res.status(200).json({ data: bonusHistory });
    } else {
      return res.status(400).json({ message: "There is no Bonus history" });
    }
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};

const getDailyIncome = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Aggregate pipeline to get daily income history
    const histories = await LevelIncome.aggregate([
      { $match: { userId: req.auth.id } },
      {
        $sort: { userId: 1, date: -1, createdAt: -1 }, // Sort the documents by userId in ascending order and date in descending order
      },
      {
        $group: {
          _id: {
            userId: "$userId",
            date: "$date",
          },
          totalAmount: { $sum: "$amount" },
          fullName: { $first: "$fullName" },
          incomeFromFullName: { $first: "$incomeFromFullName" },
        },
      },
      {
        $project: {
          _id: 0,
          userId: "$_id.userId",
          fullName: 1,
          incomeFromFullName: 1,
          date: "$_id.date",
          totalAmount: 1,
        },
      },
    ]);
    // console.log({ histories });

    const totalItems = histories.length;
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const nextPage = hasNextPage ? page + 1 : null;

    const response = {
      totalDocs: totalItems,
      limit: limit,
      totalPages: totalPages,
      page: page,
      pagingCounter: page,
      hasPrevPage: page > 1,
      hasNextPage: hasNextPage,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: nextPage,
      data: histories,
      // dateWiseTotal: totalHistories,
    };

    return res.status(200).json({
      message:
        "Retrieved the Level income history with date-wise sum of amount",
      data: response,
    });
  } catch (error) {
    console.error("Error in getDailyIncome:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const getProfitSharingIncome = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchById = req.query.searchById || null;
    const startDate = new Date(req?.query?.startDate).toDateString();
    const endDate = new Date(req?.query?.endDate).toDateString();
    const downloadCSV = req.query.csv || "";

    const queryFilter = { userId: req.auth.id, type: "profit-sharing" };

    if (searchById) {
      queryFilter.$or = [{ incomeFrom: { $regex: searchById, $options: "i" } }];
    }

    if (!startDate.includes("Invalid") && !endDate.includes("Invalid")) {
      queryFilter.date = {
        $in: getDatesInRange(startDate, endDate),
      };
    }

    const options = {
      page: page,
      limit: limit,
      sort: { createdAt: -1 },
    };

    const [totalLevelIncome] = await LevelIncome.aggregate([
      {
        $match: { userId: req.auth.id, type: "profit-sharing" },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalLevelIncome: { $sum: "$amount" },
        },
      },
    ]);

    const [dynamicTotalLevelIncome] = await LevelIncome.aggregate([
      {
        $match: queryFilter,
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          dynamicTotalLevelIncome: { $sum: "$amount" },
        },
      },
    ]);

    const incomes = await LevelIncome.paginate(queryFilter, options);

    if (totalLevelIncome) {
      incomes.totalLevelIncome = totalLevelIncome.totalLevelIncome;
    }
    if (dynamicTotalLevelIncome) {
      incomes.dynamicTotalLevelIncome =
        dynamicTotalLevelIncome.dynamicTotalLevelIncome;
    }

    if (downloadCSV) {
      const csvData = await LevelIncome.find(queryFilter);
      return res.status(200).json({ csv: csvData, data: incomes });
    }

    return res.status(200).json({ data: incomes });
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};
module.exports = {
  getLevelIncome,
  getRoiIncome,
  getRankIncome,
  getBonusIncome,
  getDailyIncome,
  getProfitSharingIncome,
};
