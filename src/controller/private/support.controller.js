const getIstTime = require("../../config/getTime");
const { getIstTimeWithInternet } = require("../../config/internetTime");
const SupportTicket = require("../../models/supportTicket.model");
const Update = require("../../models/updates.model");

const getAllSupportHistory = async (req, res) => {
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
          searchById ? { "history.userId": searchById } : {},
          searchByStartDate && searchByEndDate
            ? {
                $or: [
                  {
                    "supportDate.miliSec": {
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

    const histories = await SupportTicket.aggregate([
      { $unwind: "$history" },
      {
        $addFields: {
          "supportDate.miliSec": { $toLong: { $toDate: "$history.date" } },
        },
      },
      matchStage,
      { $sort: { "supportDate.miliSec": -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          userId: "$history.userId",
          email: "$history.email",
          mobile: "$history.mobile",
          purpose: "$history.purpose",
          previous_ticket_reff: "$history.previous_ticket_reff",
          image: "$history.image",
          question: "$history.question",
          response: "$history.response",
          date: "$history.date",
          time: "$history.time",
        },
      },
    ]);

    const totalHistoryPipleine = [
      { $unwind: "$history" },
      {
        $addFields: {
          "supportDate.miliSec": { $toLong: { $toDate: "$history.date" } },
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

    const totalHistories = await SupportTicket.aggregate(totalHistoryPipleine);

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
      const result = await SupportTicket.aggregate([
        { $unwind: "$history" },
        {
          $addFields: {
            "supportDate.miliSec": { $toLong: { $toDate: "$history.date" } },
          },
        },
        matchStage,
        {
          $project: {
            _id: 0,
            userId: "$history.userId",
            email: "$history.email",
            mobile: "$history.mobile",
            purpose: "$history.purpose",
            previous_ticket_reff: "$history.previous_ticket_reff",
            image: "$history.image",
            question: "$history.question",
            response: "$history.response",
            date: "$history.date",
            time: "$history.time",
          },
        },
      ]);
      return res.status(200).json({ csv: result, data: response });
    }

    if (totalHistories.length > 0) {
      return res.status(200).json({
        message: "List of support ticket history",
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
const createNews = async (req, res) => {
  const ISTTime = await getIstTimeWithInternet();
  const { title, description } = req.body;
  try {
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
    if (!description) {
      return res.status(400).json({ message: "Description is required" });
    }
    await Update.create({
      title: req.body.title,
      description: req.body.description,
      date: new Date(
        ISTTime?.date ? ISTTime?.date : getIstTime().date
      ).toDateString(),
    });
    return res.status(201).json({ message: "New Create Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};

const sentResponse = async (req, res) => {
  try {
    const { userId, response, question } = req.body;

    // Find the support ticket by userId and matching question in the history
    const existSupport = await SupportTicket.findOneAndUpdate(
      {
        userId,
        "history.question": question, // Find the specific question in the history
      },
      {
        $set: { "history.$.response": response }, // Set the response in the matched history
      },
      { new: true } // Return the updated document
    );

    // Check if the support ticket and question were found and updated
    if (existSupport) {
      return res.status(200).json({
        message: "Response added to the matching question",
        updatedSupport: existSupport, // Optionally return the updated support ticket
      });
    } else {
      return res.status(404).json({
        message: "Question not found in history or support ticket not found",
      });
    }
  } catch (error) {
    console.log({ error });
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};

module.exports = { getAllSupportHistory, createNews, sentResponse };
