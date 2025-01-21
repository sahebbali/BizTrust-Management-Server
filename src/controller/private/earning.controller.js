const LevelIncome = require("../../models/levelIncome.model");
const { RankIncome } = require("../../models/rankIncome.model");
const { PackageRoi } = require("../../models/topup.model");

const getAllLevelIncomeController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchById = req.query.searchById || "";
    const searchByStartDate = new Date(req.query.startDate).getTime() || "";
    const searchByEndDate = new Date(req.query.endDate).getTime() || "";
    const downloadCSV = req.query.csv || "";

    const matchStage = {
      $match: {
        $and: [
          searchById ? { userId: searchById } : {},
          searchByStartDate && searchByEndDate
            ? {
                $or: [
                  {
                    "levelDate.miliSec": {
                      $gte: searchByStartDate,
                      $lte: searchByEndDate,
                    },
                  },
                  {
                    date: new Date(searchByStartDate).toDateString(),
                  },
                ],
              }
            : {},
        ],
      },
    };

    const histories = await LevelIncome.aggregate([
      {
        $addFields: {
          "levelDate.miliSec": { $toLong: { $toDate: "$date" } },
        },
      },
      matchStage,
      { $sort: { "levelDate.miliSec": -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $project: {
          __v: 0,
        },
      },
    ]);

    const totalHistoryPipleine = [
      {
        $addFields: {
          "levelDate.miliSec": { $toLong: { $toDate: "$date" } },
        },
      },
      matchStage,
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ];

    const totalHistories = await LevelIncome.aggregate(totalHistoryPipleine);

    const totalItems = totalHistories.length > 0 ? totalHistories[0].count : 0;
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const nextPage = hasNextPage ? page + 1 : null;

    const response = {
      totalDocs: totalItems,
      limit: limit,
      totalPages: totalPages,
      totalAmount: totalHistories[0]?.totalAmount,
      page: page,
      pagingCounter: page,
      hasPrevPage: page > 1,
      hasNextPage: hasNextPage,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: nextPage,
      docs: histories,
    };
    // Download CSV
    if (downloadCSV === "csv") {
      const result = await LevelIncome.aggregate([
        {
          $addFields: {
            "levelDate.miliSec": { $toLong: { $toDate: "$date" } },
          },
        },
        matchStage,
        {
          $project: {
            __v: 0,
          },
        },
      ]);
      return res.status(200).json({ csv: result, data: response });
    }

    if (totalHistories.length > 0) {
      return res.status(200).json({
        message: "Retrieved the all Level Income History",
        data: response,
      });
    } else {
      return res.status(400).json({ message: "History Not Found" });
    }
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};

// Get roi income
const getRoiIncomeController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchById = req.query.searchById || "";
    const searchByStartDate = new Date(req.query.startDate).getTime() || "";
    const searchByEndDate = new Date(req.query.endDate).getTime() || "";
    const downloadCSV = req.query.csv || "";

    const matchStage = {
      $match: {
        $and: [
          searchById ? { userId: searchById } : {},
          searchByStartDate && searchByEndDate
            ? {
                $or: [
                  {
                    incomeDateInt: {
                      $gte: searchByStartDate,
                      $lte: searchByEndDate,
                    },
                  },
                  {
                    incomeDate: new Date(searchByStartDate).toDateString(),
                  },
                ],
              }
            : {},
        ],
      },
    };

    const histories = await PackageRoi.aggregate([
      matchStage,
      { $sort: { incomeDateInt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);

    const totalHistoryPipleine = [
      matchStage,
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAmount: { $sum: "$commissionAmount" },
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
      totalAmount: totalHistories[0]?.totalAmount,
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
        matchStage,
        { $sort: { incomeDateInt: -1 } },
        {
          $project: {
            _id: 0,
            userId,
            fullName,
            package,
            commissionPercentagePerDay,
            commissionAmount,
            totalCommissionAmount,
            incomeDate,
            incomeTime,
            transactionId,
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
      return res.status(400).json({ message: "History Not Found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
// Get Rank Income
const getRankIncomeController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchById = req.query.searchById || "";
    const searchByStartDate = new Date(req.query.startDate).getTime() || "";
    const searchByEndDate = new Date(req.query.endDate).getTime() || "";
    const downloadCSV = req.query.csv || "";

    const matchStage = {
      $match: {
        $and: [
          searchById ? { userId: searchById } : {},
          searchByStartDate && searchByEndDate
            ? {
                $or: [
                  {
                    "rankDate.miliSec": {
                      $gte: searchByStartDate,
                      $lte: searchByEndDate,
                    },
                  },
                  {
                    date: new Date(searchByStartDate).toDateString(),
                  },
                ],
              }
            : {},
        ],
      },
    };

    const histories = await RankIncome.aggregate([
      {
        $addFields: {
          "rankDate.miliSec": { $toLong: { $toDate: "$date" } },
        },
      },
      matchStage,
      { $sort: { "rankDate.miliSec": -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $project: {
          __v: 0,
        },
      },
    ]);

    const totalHistoryPipleine = [
      {
        $addFields: {
          "rankDate.miliSec": { $toLong: { $toDate: "$date" } },
        },
      },
      matchStage,
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAmount: { $sum: "$rewardAmount" },
        },
      },
    ];

    const totalHistories = await RankIncome.aggregate(totalHistoryPipleine);

    const totalItems = totalHistories.length > 0 ? totalHistories[0].count : 0;
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const nextPage = hasNextPage ? page + 1 : null;

    const response = {
      totalDocs: totalItems,
      limit: limit,
      totalPages: totalPages,
      totalAmount: totalHistories[0]?.totalAmount,
      page: page,
      pagingCounter: page,
      hasPrevPage: page > 1,
      hasNextPage: hasNextPage,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: nextPage,
      docs: histories,
    };

    // Download CSV
    if (downloadCSV === "csv") {
      const result = await RankIncome.aggregate([
        {
          $addFields: {
            "rankDate.miliSec": { $toLong: { $toDate: "$date" } },
          },
        },
        matchStage,
        {
          $project: {
            __v: 0,
          },
        },
      ]);
      return res.status(200).json({ csv: result, data: response });
    }

    if (totalHistories.length > 0) {
      return res.status(200).json({
        message: "Retrieved the rank Income History",
        data: response,
      });
    } else {
      return res.status(400).json({ message: "History Not Found" });
    }
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};
// Bonus income
const getBonusIncomeController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchById = req.query.searchById || "";
    const searchByStartDate = new Date(req.query.startDate).getTime() || "";
    const searchByEndDate = new Date(req.query.endDate).getTime() || "";
    const downloadCSV = req.query.csv || "";

    const matchStage = {
      $match: {
        $and: [
          { bonusAmount: { $gt: 0 } },
          searchById ? { userId: searchById } : {},
          searchByStartDate && searchByEndDate
            ? {
                $or: [
                  {
                    "rankDate.miliSec": {
                      $gte: searchByStartDate,
                      $lte: searchByEndDate,
                    },
                  },
                  {
                    date: new Date(searchByStartDate).toDateString(),
                  },
                ],
              }
            : {},
        ],
      },
    };

    const histories = await RankIncome.aggregate([
      {
        $addFields: {
          "rankDate.miliSec": { $toLong: { $toDate: "$date" } },
        },
      },
      matchStage,
      { $sort: { "rankDate.miliSec": -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $project: {
          __v: 0,
          rankDate: 0,
          rewardAmount: 0,
        },
      },
    ]);

    const totalHistoryPipleine = [
      {
        $addFields: {
          "rankDate.miliSec": { $toLong: { $toDate: "$date" } },
        },
      },
      matchStage,
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAmount: { $sum: "$bonusAmount" },
        },
      },
    ];

    const totalHistories = await RankIncome.aggregate(totalHistoryPipleine);

    const totalItems = totalHistories.length > 0 ? totalHistories[0].count : 0;
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const nextPage = hasNextPage ? page + 1 : null;

    const response = {
      totalDocs: totalItems,
      limit: limit,
      totalPages: totalPages,
      totalAmount: totalHistories[0]?.totalAmount,
      page: page,
      pagingCounter: page,
      hasPrevPage: page > 1,
      hasNextPage: hasNextPage,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: nextPage,
      docs: histories,
    };
    if (downloadCSV === "csv") {
      const result = await RankIncome.aggregate([
        {
          $addFields: {
            "rankDate.miliSec": { $toLong: { $toDate: "$date" } },
          },
        },
        matchStage,
        {
          $project: {
            __v: 0,
          },
        },
      ]);
      return res.status(200).json({ csv: result, data: response });
    }

    if (totalHistories.length > 0) {
      return res.status(200).json({
        message: "Retrieved the bonus Income History",
        data: response,
      });
    } else {
      return res.status(400).json({ message: "History Not Found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  getAllLevelIncomeController,
  getRoiIncomeController,
  getRankIncomeController,
  getBonusIncomeController,
};
