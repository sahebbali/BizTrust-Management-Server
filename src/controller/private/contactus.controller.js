const Contact = require("../../models/contactus.model");

const getAllContactUsHistory = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    const searchById = req.query.searchById || "";
    const searchByStartDate = new Date(req.query.startDate).getTime() || "";
    const searchByEndDate = new Date(req.query.endDate).getTime() || "";
    const downloadCSV = req.query.csv || "";

    const matchStage = {
      $match: {
        $and: [
          searchById ? { "history.userId": searchById } : {},
          searchByStartDate && searchByEndDate
            ? {
                $or: [
                  {
                    "contactDate.miliSec": {
                      $gte: searchByStartDate,
                      $lte: searchByEndDate,
                    },
                  },
                  {
                    "history.date": new Date(searchByStartDate).toDateString(),
                  },
                ],
              }
            : {},
        ],
      },
    };

    const histories = await Contact.aggregate([
      { $unwind: "$history" },
      {
        $addFields: {
          "contactDate.miliSec": { $toLong: { $toDate: "$history.date" } },
        },
      },
      matchStage,
      { $sort: { "contactDate.miliSec": -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          userId: "$history.userId",
          user_name: "$history.user_name",
          email: "$history.email",
          message: "$history.message",
          subject: "$history.subject",
          date: "$history.date",
          mobile: "$history.mobile",
          time: "$history.time",
        },
      },
    ]);

    const totalHistoryPipleine = [
      { $unwind: "$history" },
      {
        $addFields: {
          "contactDate.miliSec": { $toLong: { $toDate: "$history.date" } },
        },
      },
      matchStage,
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ];

    const totalHistories = await Contact.aggregate(totalHistoryPipleine);

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

    if (downloadCSV === "csv") {
      const result = await Contact.aggregate([
        { $unwind: "$history" },
        {
          $addFields: {
            "contactDate.miliSec": { $toLong: { $toDate: "$history.date" } },
          },
        },
        matchStage,
        {
          $project: {
            _id: 0,
            userId: "$history.userId",
            user_name: "$history.user_name",
            email: "$history.email",
            message: "$history.message",
            subject: "$history.subject",
            date: "$history.date",
            time: "$history.time",
          },
        },
      ]);
      return res.status(200).json({ csv: result, data: response });
    }

    if (totalHistories.length > 0) {
      return res.status(200).json({
        message: "Retrieved the all contact history",
        data: response,
      });
    } else {
      return res.status(400).json({ message: "History Not Found" });
    }
  } catch (error) {
    return res.status(400).json({
      message: error.toString(),
    });
  }
};

module.exports = getAllContactUsHistory;
