const getIstTime = require("../../config/getTime");
const sendEmailNotification = require("../../config/mailNotification");
const User = require("../../models/auth.model");
const { PackageRoi, PackageBuyInfo } = require("../../models/topup.model");
const Wallet = require("../../models/wallet.model");
const Withdraw = require("../../models/withdraw.model");

// Show all withdraws
const showAllWithdraw = async (req, res) => {
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
                    "withdrawDate.miliSec": {
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

    const histories = await Withdraw.aggregate([
      {
        $addFields: {
          "withdrawDate.miliSec": { $toLong: { $toDate: "$date" } },
        },
      },
      matchStage,
      { $sort: { "withdrawDate.miliSec": -1, createdAt: -1 } },
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
          "withdrawDate.miliSec": { $toLong: { $toDate: "$date" } },
        },
      },
      matchStage,
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAmount: { $sum: "$requestAmount" },
        },
      },
    ];

    const totalHistories = await Withdraw.aggregate(totalHistoryPipleine);

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
      const result = await Withdraw.aggregate([
        {
          $addFields: {
            "withdrawDate.miliSec": { $toLong: { $toDate: "$date" } },
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
        message: "Retrieved the withdraw histories",
        data: response,
      });
    } else {
      return res.status(400).json({ message: "History Not Found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// Controller to get successful withdraw requests
const getSuccessfulWithdraws = async (req, res) => {
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
          { status: "success" },
          searchById ? { userId: searchById } : {},
          searchByStartDate && searchByEndDate
            ? {
                $or: [
                  {
                    "withdrawDate.miliSec": {
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

    const histories = await Withdraw.aggregate([
      {
        $addFields: {
          "withdrawDate.miliSec": { $toLong: { $toDate: "$date" } },
        },
      },
      matchStage,
      { $sort: { "withdrawDate.miliSec": -1 } },
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
          "withdrawDate.miliSec": { $toLong: { $toDate: "$date" } },
        },
      },
      matchStage,
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAmount: { $sum: "$requestAmount" },
        },
      },
    ];

    const totalHistories = await Withdraw.aggregate(totalHistoryPipleine);

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
      const result = await Withdraw.aggregate([
        {
          $addFields: {
            "withdrawDate.miliSec": { $toLong: { $toDate: "$date" } },
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
        message: "Retrieved the successfully withdraw histories",
        data: response,
      });
    } else {
      return res.status(400).json({ message: "History Not Found" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// Controller to get rejected withdraw requests
const getRejectedWithdraws = async (req, res) => {
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
          { status: "reject" },
          searchById ? { userId: searchById } : {},
          searchByStartDate && searchByEndDate
            ? {
                $or: [
                  {
                    "withdrawDate.miliSec": {
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

    const histories = await Withdraw.aggregate([
      {
        $addFields: {
          "withdrawDate.miliSec": { $toLong: { $toDate: "$date" } },
        },
      },
      matchStage,
      { $sort: { "withdrawDate.miliSec": -1 } },
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
          "withdrawDate.miliSec": { $toLong: { $toDate: "$date" } },
        },
      },
      matchStage,
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAmount: { $sum: "$requestAmount" },
        },
      },
    ];

    const totalHistories = await Withdraw.aggregate(totalHistoryPipleine);

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
      const result = await Withdraw.aggregate([
        {
          $addFields: {
            "withdrawDate.miliSec": { $toLong: { $toDate: "$date" } },
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
        message: "Retrieved the withdraw histories",
        data: response,
      });
    } else {
      return res.status(400).json({ message: "History Not Found" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};
// Controller to update the status of a withdraw request
const updateWithdrawStatus = async (req, res) => {
  try {
    const { transaction_id, status, userId } = req.body;
    console.log(transaction_id, status, userId);
    const currentUser = await User.findOne({ userId: userId });
    let message = "";
    const existingWithdraw = await Withdraw.findOne({
      status: "pending",
      transactionId: transaction_id,
    });

    if (existingWithdraw) {
      if (status === "success") {
        await Withdraw.findOneAndUpdate(
          {
            userId: userId,
            status: "pending",
            transactionId: transaction_id,
          },
          {
            $set: {
              status: status,
            },
          }
        );
        // withdraw type is investment create packageInfo history
        if (existingWithdraw?.withdrawType === "investment") {
          await PackageBuyInfo.create({
            userId: existingWithdraw.userId,
            userFullName: existingWithdraw.userFullName,
            sponsorId: existingWithdraw.sponsorId,
            sponsorName: existingWithdraw.sponsorName,
            packageInfo: {
              amount: existingWithdraw.requestAmount,
              date: new Date(getIstTime().date).toDateString(),
              time: getIstTime().time,
            },
            packageType: "Withdraw IA",
          });
        }
        // Send mail notifiction to user email with request status
        sendEmailNotification(
          currentUser?.userId,
          currentUser?.fullName,
          currentUser?.email,
          "Withdrawal Request Status Update",
          existingWithdraw?.requestAmount,
          "Your withdrawal request has been successfully processed, and the funds have been transferred to your designated account.",
          "withdrawal"
        );
        message = "Withdraw Successfully";
        return res.status(200).json({ message });
      } else {
        await Withdraw.findOneAndUpdate(
          {
            userId: userId,
            status: "pending",
            transactionId: transaction_id,
          },
          {
            $set: {
              status: status,
            },
          }
        );
        if (existingWithdraw?.withdrawType === "investment") {
          const extPackage = await PackageRoi.findOne({ userId: userId });
          await Wallet.findOneAndUpdate(
            { userId: userId },
            { $inc: { investmentAmount: +existingWithdraw?.requestAmount } },
            { new: true }
          );
          await User.findOneAndUpdate(
            { userId: userId },
            {
              $set: {
                isActive: true,
                packageInfo: {
                  amount: extPackage?.currentPackage,
                },
              },
            }
          );
          await PackageRoi.findOneAndUpdate(
            { userId: userId },
            { $set: { isActive: true } }
          );
        } else if (existingWithdraw?.withdrawType === "profit") {
          await Wallet.findOneAndUpdate(
            { userId: userId },
            { $inc: { activeIncome: +existingWithdraw?.requestAmount } },
            { new: true }
          );
        }
        // Send mail notifiction to user email with request status
        sendEmailNotification(
          currentUser?.userId,
          currentUser?.fullName,
          currentUser?.email,
          "Withdrawal Request Status Update",
          existingWithdraw?.requestAmount,
          `Unfortunately, your withdrawal request for $${existingWithdraw?.requestAmount} amount has been rejected.`,
          "withdrawal"
        );
        message = "Withdraw Rejected";
      }
      return res.status(400).json({
        message,
      });
    } else {
      return res.status(400).json({
        message: "Status Cannot be changed",
      });
    }
  } catch (e) {
    console.log(e);
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};
// Controller to update the status of a withdraw request
const updateWithdrawAllStatus = async (req, res) => {
  try {
    const pendingWithdrawals = req.body;

    if (pendingWithdrawals?.length > 0) {
      for (const existingWithdraw of pendingWithdrawals) {
        const { transaction_id, userId } = existingWithdraw;
        const currentWithdraw = await Withdraw.findOneAndUpdate(
          {
            userId: userId,
            status: "pending",
            transactionId: transaction_id,
          },
          {
            $set: {
              status: "success",
            },
          }
        );

        const currentUser = await User.findOne({ userId: userId });

        // Send mail notification to user email with request status
        sendEmailNotification(
          currentUser?.userId,
          currentUser?.fullName,
          currentUser?.email,
          "Withdrawal Request Status Update",
          currentWithdraw.requestAmount,
          "Your withdrawal request has been successfully processed, and the funds have been transferred to your designated account.",
          "withdrawal"
        );
      }

      return res
        .status(200)
        .json({ message: "All pending withdrawals successfully processed" });
    } else {
      return res.status(400).json({
        message: "No pending withdrawals found",
      });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
const updateWithdrawAllStatusReject = async (req, res) => {
  try {
    const pendingWithdrawals = req.body;

    if (pendingWithdrawals?.length > 0) {
      for (const existingWithdraw of pendingWithdrawals) {
        const { transaction_id, userId } = existingWithdraw;
        const currentWithdrawItems = await Withdraw.findOneAndUpdate(
          {
            userId: userId,
            status: "pending",
            transactionId: transaction_id,
          },
          {
            $set: {
              status: "reject",
            },
          }
        );
        if (currentWithdrawItems?.withdrawType === "investment") {
          const extPackage = await PackageRoi.findOne({ userId: userId });
          await Wallet.findOneAndUpdate(
            { userId: userId },
            {
              $inc: { investmentAmount: +currentWithdrawItems?.requestAmount },
            },
            { new: true }
          );
          await User.findOneAndUpdate(
            { userId: userId },
            {
              $set: {
                isActive: true,
                packageInfo: {
                  amount: extPackage?.currentPackage,
                },
              },
            }
          );
          await PackageRoi.findOneAndUpdate(
            { userId: userId },
            { $set: { isActive: true } }
          );
        } else if (currentWithdrawItems?.withdrawType === "profit") {
          await Wallet.findOneAndUpdate(
            { userId: userId },
            { $inc: { activeIncome: +currentWithdrawItems?.requestAmount } },
            { new: true }
          );
        }

        const currentUser = await User.findOne({ userId: userId });

        // Send mail notifiction to user email with request status
        sendEmailNotification(
          currentUser?.userId,
          currentUser?.fullName,
          currentUser?.email,
          "Withdrawal Request Status Update",
          currentWithdrawItems?.requestAmount,
          `Unfortunately, your withdrawal request for $${currentWithdrawItems?.requestAmount} amount has been rejected.`,
          "withdrawal"
        );

        // const currentUser = await User.findOne({ userId: userId });

        // // Send mail notification to user email with request status
        // sendEmailNotification(
        //   currentUser?.userId,
        //   currentUser?.fullName,
        //   currentUser?.email,
        //   "Withdrawal Request Status Update",
        //   currentWithdraw.requestAmount,
        //   "Your withdrawal request has been successfully processed, and the funds have been transferred to your designated account.",
        //   "withdrawal"
        // );
      }

      return res
        .status(200)
        .json({ message: "All pending withdrawals Rejected" });
    } else {
      return res.status(400).json({
        message: "No pending withdrawals found",
      });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

module.exports = {
  showAllWithdraw,
  updateWithdrawStatus,
  getSuccessfulWithdraws,
  getRejectedWithdraws,
  updateWithdrawAllStatus,
  updateWithdrawAllStatusReject,
};
