const getIstTime = require("../../config/getTime");
const sendEmailNotification = require("../../config/mailNotification");
const SendManageDepositMail = require("../../config/sendManageDepositMail");

const User = require("../../models/auth.model");
const Deposit = require("../../models/deposit.model");
const ManageDepositHistory = require("../../models/manageDeposite.model");
const ManageDepositAuth = require("../../models/mangeDepositeAuth.model");
const Wallet = require("../../models/wallet.model");
const bcrypt = require("bcryptjs");
const getDatesInRange = require("../../config/getDatesInRange");
const levelIncome = require("../../utils/levelIncome");
const { updatePackageAmount } = require("../../utils/updatePackageAmount");
const ProvideExtraEarning = require("../../utils/ProvideExtraEarning");
const { PackageBuyInfo } = require("../../models/topup.model");
const rewardIncome = require("../../utils/rewardIncome");

const updateRemark = async (req, res) => {
  try {
    const { userId, amount, date, transactionId, hash, remark } = req.body;

    if (!userId || !amount || !date || !transactionId || !hash) {
      return res.status(500).json({
        message: "Data Missing",
      });
    }

    await Deposit.findOneAndUpdate(
      {
        userId: userId,
        amount: amount,
        date: date,
        transactionId: transactionId,
        hash: hash,
      },
      {
        $set: { remark: remark },
      }
    );

    return res.status(200).json({
      message: "Remark updated",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something Went wrong",
    });
  }
};

// Show all deposits
const showAllDeposits = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchById = req.query.searchById || null;
    const startDate = new Date(req?.query?.startDate).toDateString();
    const endDate = new Date(req?.query?.endDate).toDateString();
    const downloadCSV = req.query.csv || "";

    const queryFilter = {};

    if (searchById) {
      queryFilter.userId = searchById;
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

    const d = await Deposit.aggregate([
      {
        $match: queryFilter,
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const deposits = await Deposit.paginate(queryFilter, options);
    deposits.totalAmount = d.length ? d[0].totalAmount : 0;

    if (downloadCSV) {
      const csvData = await Deposit.find(queryFilter);
      return res.status(200).json({ csv: csvData, data: deposits });
    }

    return res.status(200).json({ data: deposits });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// Show successful deposits
const showSuccessDeposits = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchById = req.query.searchById || null;
    const startDate = new Date(req?.query?.startDate).toDateString();
    const endDate = new Date(req?.query?.endDate).toDateString();
    const downloadCSV = req.query.csv || "";
    const status = req.query.status || "";
    const queryFilter = { status };

    if (searchById) {
      queryFilter.userId = searchById;
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

    const d = await Deposit.aggregate([
      {
        $match: queryFilter,
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const deposits = await Deposit.paginate(queryFilter, options);
    deposits.totalAmount = d.length ? d[0].totalAmount : 0;

    if (downloadCSV) {
      const csvData = await Deposit.find(queryFilter);
      return res.status(200).json({ csv: csvData, data: deposits });
    }

    return res.status(200).json({ data: deposits });
  } catch (error) {
    return res.status(500).json({
      message: "Something Went wrong",
    });
  }
};
// Show rejected deposits
const showRejectedDeposits = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchById = req.query.searchById || null;
    const startDate = new Date(req?.query?.startDate).toDateString();
    const endDate = new Date(req?.query?.endDate).toDateString();
    const downloadCSV = req.query.csv || "";

    const queryFilter = { status: "reject" };

    if (searchById) {
      queryFilter.userId = searchById;
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

    const d = await Deposit.aggregate([
      {
        $match: queryFilter,
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const deposits = await Deposit.paginate(queryFilter, options);
    deposits.totalAmount = d.length ? d[0].totalAmount : 0;

    if (downloadCSV) {
      const csvData = await Deposit.find(queryFilter);
      return res.status(200).json({ csv: csvData, data: deposits });
    }

    return res.status(200).json({ data: deposits });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// Update the status of a deposit based on its _id
const updateDepositStatus = async (req, res) => {
  try {
    const { transaction_id, status } = req.body;
    let message = "";

    const existingDeposit = await Deposit.findOne({
      status: "pending",
      transactionId: transaction_id,
    });

    const currentUser = await User.findOne({ userId: existingDeposit?.userId });

    if (existingDeposit) {
      await Deposit.findOneAndUpdate(
        {
          userId: existingDeposit?.userId,
          amount: existingDeposit.amount,
          transactionId: transaction_id,
        },
        {
          $set: { status: status },
        }
      );

      if (status === "success") {
        // await Wallet.findOneAndUpdate(
        //   { userId: existingDeposit.userId },
        //   {
        //     $inc: {
        //       depositBalance: +existingDeposit.amount,
        //     },
        //   }
        // );

        await User.findOneAndUpdate(
          { userId: existingDeposit?.userId },
          { $set: { isActive: true, activationDate: new Date() } }
        );
        sendEmailNotification(
          currentUser?.userId,
          currentUser?.fullName,
          currentUser?.email,
          "Deposit Successful – Grow-Boo International",
          existingDeposit.amount,
          "Your deposit request has been successfully processed, and the funds have been added to your wallet",
          "deposit"
        );

        // Calculate start date (after 48 hours)
        const startDate = new Date(
          new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi" })
        );
        startDate.setTime(startDate.getTime() + 48 * 60 * 60 * 1000);
        const startDateObj = new Date(startDate);

        // Check security type for end date calculation
        let endDateObj = new Date(startDateObj);

        if (existingDeposit?.securityType === "Equity Fund") {
          // 30 months = 2.5 years
          endDateObj.setMonth(endDateObj.getMonth() + 30);
        } else {
          // Default: 24 months = 2 years
          endDateObj.setMonth(endDateObj.getMonth() + 24);
        }

        const updatePackage = await PackageBuyInfo.create({
          userId: existingDeposit?.userId,
          userFullName: currentUser?.fullName,
          sponsorId: currentUser?.sponsorId,
          sponsorName: currentUser?.sponsorName,
          packageAmount: existingDeposit?.amount,
          packageLimit:
            existingDeposit?.securityType === "Equity Fund"
              ? existingDeposit?.amount * 3
              : existingDeposit?.amount * 2,
          packageId:
            Date.now().toString(36) + Math.random().toString(36).substring(2),
          isActive: true,
          status: "success",
          startDate: startDateObj.toDateString(), // Use the formatted start date
          startDateInt: startDateObj.getTime(), // Use timestamp for startDateInt
          endDate: endDateObj.toDateString(), // Use the formatted end date
          endDateInt: endDateObj.getTime(), // Use timestamp for endDateInt
          packageType: existingDeposit?.securityType,
          date: new Date().toDateString(),
        });
        await ProvideExtraEarning(updatePackage?.userId);
        await updatePackageAmount(
          existingDeposit?.userId,
          existingDeposit?.amount,
          existingDeposit?.securityType
        );
        await levelIncome(
          updatePackage.userId,
          updatePackage.userFullName,
          updatePackage.packageAmount
        );
        await rewardIncome(updatePackage?.sponsorId);
        message = "Deposit succeeded & Package activated";
      } else {
        // Send mail notifiction to user email with request status
        sendEmailNotification(
          currentUser?.userId,
          currentUser?.fullName,
          currentUser?.email,
          "Deposit Request Rejected – Grow-Boo International",
          existingDeposit?.amount,
          `Unfortunately, Your deposit request for $${existingDeposit?.amount} amount has been rejected.`,
          "deposit"
        );
        message = "Deposit Rejected";
      }
      return res.status(200).json({
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

// Show rejected deposits
const getAllManageDeposits = async (req, res) => {
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
                    "depositDate.miliSec": {
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

    const histories = await Wallet.aggregate([
      {
        $addFields: {
          "depositDate.miliSec": { $toLong: { $toDate: "$history.date" } },
        },
      },
      matchStage,
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          userId: 1,
          fullName: 1,
          depositBalance: 1,
        },
      },
    ]);

    const totalHistoryPipleine = [
      {
        $addFields: {
          "depositDate.miliSec": { $toLong: { $toDate: "$history.date" } },
        },
      },
      matchStage,
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAmount: { $sum: "$depositBalance" },
        },
      },
    ];

    const totalHistories = await Wallet.aggregate(totalHistoryPipleine);

    const totalItems = totalHistories.length > 0 ? totalHistories[0].count : 0;
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const nextPage = hasNextPage ? page + 1 : null;

    histories.sort((a, b) => {
      // Parse the date strings to compare
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);

      // Compare the dates
      if (dateA < dateB) return 1;
      if (dateA > dateB) return -1;

      // If dates are equal, compare the times
      const timeA = new Date(`1970-01-01T${a.time}`);
      const timeB = new Date(`1970-01-01T${b.time}`);

      if (timeA < timeB) return 1;
      if (timeA > timeB) return -1;

      // If both date and time are equal, return 0
      return 0;
    });

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
      const result = await Wallet.aggregate([
        { $unwind: "$history" },
        {
          $addFields: {
            "depositDate.miliSec": { $toLong: { $toDate: "$history.date" } },
          },
        },
        matchStage,
      ]);
      return res.status(200).json({ csv: result, data: response });
    }

    if (totalHistories.length > 0) {
      return res.status(200).json({
        message: "List of manage deposits",
        data: response,
      });
    } else {
      return res.status(400).json({ message: "History Not Found" });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
// update manage deposit amount
// Update the status of a deposit based on its _id
const updateManageDepositAmount = async (req, res) => {
  try {
    const { date, time } = getIstTime();
    const { userId, amount } = req.body;

    // Check if user exists
    const existWallet = await Wallet.findOne({ userId });
    if (!existWallet) {
      return res.status(400).json({ message: "User Not Found" });
    }

    // Update deposit balance
    const previousDepositBalance = existWallet.depositBalance;
    existWallet.depositBalance = amount;
    await existWallet.save();

    // Calculate changes in deposit balance
    const changeAmount = amount - previousDepositBalance;
    const plusAmount = changeAmount > 0 ? changeAmount : 0;
    const minusAmount = changeAmount < 0 ? changeAmount : 0;

    // Create deposit history record
    await ManageDepositHistory.create({
      userId: existWallet.userId,
      fullName: existWallet.fullName,
      priviesDepositBalance: previousDepositBalance,
      currentDeposit: amount,
      minusAmount,
      plusAmount,
      date: new Date(date).toDateString(),
      time,
    });
    let today = new Date(date).toDateString();

    SendManageDepositMail(
      existWallet.userId,
      existWallet.fullName,
      previousDepositBalance,
      amount,
      minusAmount,
      plusAmount,
      today,
      time
    );
    return res.status(200).json({
      message: "Update Success",
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};

// Show rejected deposits
const getAllManageDepositHistory = async (req, res) => {
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
                    "depositDate.miliSec": {
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

    const histories = await ManageDepositHistory.aggregate([
      {
        $addFields: {
          "depositDate.miliSec": { $toLong: { $toDate: "$history.date" } },
        },
      },
      matchStage,
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);

    const totalHistoryPipleine = [
      {
        $addFields: {
          "depositDate.miliSec": { $toLong: { $toDate: "$date" } },
        },
      },
      matchStage,
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAmount: { $sum: "$currentDeposit" },
        },
      },
    ];

    const totalHistories = await ManageDepositHistory.aggregate(
      totalHistoryPipleine
    );

    const totalItems = totalHistories.length > 0 ? totalHistories[0].count : 0;
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const nextPage = hasNextPage ? page + 1 : null;

    histories.sort((a, b) => {
      // Parse the date strings to compare
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);

      // Compare the dates
      if (dateA < dateB) return 1;
      if (dateA > dateB) return -1;

      // If dates are equal, compare the times
      const timeA = new Date(`1970-01-01T${a.time}`);
      const timeB = new Date(`1970-01-01T${b.time}`);

      if (timeA < timeB) return 1;
      if (timeA > timeB) return -1;

      // If both date and time are equal, return 0
      return 0;
    });

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
      const result = await ManageDepositHistory.aggregate([
        {
          $addFields: {
            "depositDate.miliSec": { $toLong: { $toDate: "$date" } },
          },
        },
        matchStage,
      ]);
      return res.status(200).json({ csv: result, data: response });
    }

    if (totalHistories.length > 0) {
      return res.status(200).json({
        message: "List of manage deposits",
        data: response,
      });
    } else {
      return res.status(400).json({ message: "History Not Found" });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
const createManageDepositAuth = async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User Id is missing" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is missing" });
    }

    // Check if the user already has an authentication entry
    const existingAuth = await ManageDepositAuth.findOne({ userId });

    if (existingAuth) {
      // If authentication exists, update the password
      await ManageDepositAuth.findByIdAndUpdate(existingAuth._id, { password });
    } else {
      // If authentication doesn't exist, create a new one
      await ManageDepositAuth.create({ userId, password });
    }

    // Respond with success message
    return res
      .status(200)
      .json({ message: "Authentication updated successfully" });
  } catch (error) {
    // Handle errors
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
const loginManageDepositAuth = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is missing" });
    }

    const existingAuth = await ManageDepositAuth.findOne({
      userId: "admin",
    });

    const result = await bcrypt.compare(password, existingAuth.password);

    if (result) {
      return res.status(200).json({ message: "Login Success" });
    } else {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Export the showAllDeposits function for use in your routes
module.exports = {
  updateRemark,
  showAllDeposits,
  showSuccessDeposits,
  showRejectedDeposits,
  updateDepositStatus,
  getAllManageDeposits,
  updateManageDepositAmount,
  getAllManageDepositHistory,
  createManageDepositAuth,
  loginManageDepositAuth,
};
