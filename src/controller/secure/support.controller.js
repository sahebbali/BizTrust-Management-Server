const cloudinary = require("../../config/cloudinary");
const getIstTime = require("../../config/getTime");
const { getIstTimeWithInternet } = require("../../config/internetTime");
const User = require("../../models/auth.model");
const createNews = require("../../models/createNews.model");
const SupportTicket = require("../../models/supportTicket.model");
const Update = require("../../models/updates.model");

// get updates
const getUpdates = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const queryFilter = {};

    const options = {
      page: page,
      limit: limit,
      sort: { createdAt: -1 }, // Sorting by _id in descending order
    };

    const updates = await Update.paginate(queryFilter, options);
    if (updates?.docs?.length > 0) {
      return res.status(200).json({ data: updates });
    } else {
      return res.status(400).json({
        message: "Cannot find any updates",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// Support ticket
const createSupportTicket = async (req, res) => {
  const ISTTime = await getIstTimeWithInternet();
  try {
    const { purpose, previous_ticket_reff, question } = req.body;
    const user_id = req.auth.id;

    if (!req.body)
      return res.status(400).json({
        message: "Please provide data",
      });
    if (!req.file?.path)
      return res.status(400).json({
        message: "Image is missing",
      });
    if (!user_id)
      return res.status(400).json({
        message: "User Id is missing",
      });
    if (!purpose)
      return res.status(400).json({
        message: "Purpose is missing",
      });
    if (!previous_ticket_reff)
      return res.status(400).json({
        message: "Previous reference is missing",
      });
    if (!question)
      return res.status(400).json({
        message: "Question is missing",
      });

    // find user
    const user = await User.findOne({ userId: user_id });

    // upload the image
    const image = await cloudinary.uploader.upload(req.file?.path);
    const avatar = {
      avatar: image.secure_url,
      avatar_public_url: image.public_id,
    };

    if (user) {
      // already have support tckect collection or not
      const existingSupport = await SupportTicket.findOne({ userId: user_id });
      if (!existingSupport) {
        const newSupportTicket = await SupportTicket.create({
          userId: user.userId,
          user_name: user.fullName,
          history: [
            {
              userId: user.userId,
              email: user.email,
              mobile: user.mobile,
              purpose: purpose,
              previous_ticket_reff: previous_ticket_reff,
              image: avatar,
              question: question,
              date: new Date(
                ISTTime?.date ? ISTTime?.date : getIstTime().date
              ).toDateString(),
              time: ISTTime?.time ? ISTTime?.time : getIstTime().time,
            },
          ],
        });
        if (newSupportTicket) {
          return res.status(200).json({
            message: "Support ticket created successfully",
          });
        } else {
          return res.status(400).json({
            message: "Cannot create support ticket",
          });
        }
      } else {
        // update existing support
        const updateSupport = await SupportTicket.findOneAndUpdate(
          { userId: user_id },
          {
            $push: {
              history: {
                userId: user.userId,
                email: user.email,
                mobile: user.mobile,
                purpose: purpose,
                previous_ticket_reff: previous_ticket_reff,
                image: avatar,
                question: question,
                date: new Date(
                  ISTTime?.date ? ISTTime?.date : getIstTime().date
                ).toDateString(),
                time: ISTTime?.time ? ISTTime?.time : getIstTime().time,
              },
            },
          }
        );
        if (updateSupport) {
          return res.status(200).json({
            message: "Support ticket created successfully",
          });
        } else {
          return res.status(400).json({
            message: "Cannot create support ticket",
          });
        }
      }
    } else {
      return res.status(400).json({
        message: "Invalid user credentials",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// get support history
const getSupportHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const histories = await SupportTicket.aggregate([
      {
        $match: {
          userId: req.auth.id,
        },
      },
      { $unwind: "$history" },
      { $sort: { "history.date": -1 } },
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

    if (totalHistories.length > 0) {
      return res.status(200).json({
        message: "Retrieved the ticket history",
        data: response,
      });
    } else {
      return res.status(400).json({ message: "Ticket history is empty" });
    }

    const userId = req.auth.id;
    if (userId) {
      const supportTicket = await SupportTicket.findOne({
        userId: userId,
      }).sort({ "history.date": -1, "history.time": -1 });
      if (supportTicket) {
        return res.status(200).json(supportTicket);
      } else {
        return res.status(400).json({
          message: "Cannot find support ticket",
        });
      }
    } else {
      return res.status(400).json({
        message: "Cannot find user credentials",
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: error.toString(),
    });
  }
};
//get all news
const GetAllNews = async (req, res) => {
  try {
    const news = await createNews.find({}, { __v: 0 });

    res.status(200).json({ news });
  } catch (error) {
    res.status(500).json({
      message: "Could not retrieve news",
      error: "Something Went Wrong",
    });
  }
};

module.exports = {
  getUpdates,
  createSupportTicket,
  getSupportHistory,
  GetAllNews,
};
