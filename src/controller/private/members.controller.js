const getDatesInRange = require("../../config/getDatesInRange");
const User = require("../../models/auth.model");
const Level = require("../../models/level.model");
const Pin = require("../../models/pin.model");
const { RankIncome } = require("../../models/rankIncome.model");
const { PackageBuyInfo } = require("../../models/topup.model");
const Wallet = require("../../models/wallet.model");
const WalletAddress = require("../../models/walletAddress.model");
const Withdraw = require("../../models/withdraw.model");
const Otp = require("../../models/otp.model");
const sendOtpMail = require("../../config/sendOtpMail");
const { getIstTimeWithInternet } = require("../../config/internetTime");
const getIstTime = require("../../config/getTime");
const { checkDate } = require("../../utils/rankIncome");
const Kyc = require("../../models/KYCSchema");
const CalculateLinePackageAmount = require("../../utils/CalculateLinePackageAmount");

const findThisMonthTotalTeamBusiness = async (req, res) => {
  try {
    const level = req.query.level;
    const userId = req.query.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchById = req.query.searchById || null;
    const startDate = new Date(req?.query?.startDate).toDateString();
    const endDate = new Date(req?.query?.endDate).toDateString();
    const downloadCSV = req.query.csv || "";

    let levelQueryFilter = {
      $or: [{ $eq: ["$$level.level", level] }],
    };

    if (level === "all-level") {
      levelQueryFilter = {};
    }

    if (searchById && level !== "all-level") {
      levelQueryFilter = {
        $and: [
          { $eq: ["$$level.userId", searchById] },
          { $eq: ["$$level.level", level] },
        ],
      };
    } else if (searchById && level === "all-level") {
      levelQueryFilter = {
        $and: [{ $eq: ["$$level.userId", searchById] }],
      };
    }

    const levelUsers = await Level.aggregate([
      {
        $match: {
          userId: userId,
        },
      },
      {
        $project: {
          _id: 0,
          userId: {
            $filter: {
              input: "$level",
              as: "level",
              cond: levelQueryFilter,
            },
          },
        },
      },
      {
        $unwind: "$userId",
      },
      {
        $lookup: {
          from: "users",
          localField: "userId.userId",
          foreignField: "userId",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $match: {
          "userDetails.isActive": true,
        },
      },
      {
        $group: {
          _id: null,
          userIds: {
            $push: {
              userId: "$userId.userId",
              level: "$userId.level",
            },
          },
        },
      },
    ]);

    const user = await User.findOne({ userId: userId });
    const rankIncomeCurrentDate = user?.rankIncomeCurrentDateString;

    const checkNext30Days = new Date(rankIncomeCurrentDate);
    checkNext30Days.setDate(checkNext30Days.getDate() + 29);
    const next30Days = checkNext30Days.getTime();
    const dates = getDatesInRange(
      new Date(user?.rankIncomeCurrentDateString).toDateString(),
      new Date(next30Days).toDateString()
    );

    const businesses = await Promise.all(
      levelUsers[0]?.userIds.map(async (lu) => {
        const packageBuyInfos = await PackageBuyInfo.find({
          userId: lu.userId,
        });

        return packageBuyInfos
          .filter((p) => dates.includes(p?.packageInfo?.date))
          .map((p) => ({
            ...p.toObject(),
            level: lu.level,
          }));
      })
    );

    const flattenedBusinesses = businesses.flat();
    let filteredData = flattenedBusinesses;

    if (!startDate.includes("Invalid") && !endDate.includes("Invalid")) {
      const filteredDates = getDatesInRange(startDate, endDate);
      filteredData = flattenedBusinesses.filter((d) =>
        filteredDates.includes(d?.packageInfo?.date)
      );
    }

    const { withdrawAmountForAll, withoutWithdrawAmountForAll } =
      filteredData.reduce(
        (acc, d) => {
          if (d?.packageType === "Withdraw IA") {
            acc.withdrawAmountForAll += d?.packageInfo?.amount || 0;
          } else {
            acc.withoutWithdrawAmountForAll += d?.upgradedAmount || 0;
          }
          return acc;
        },
        { withdrawAmountForAll: 0, withoutWithdrawAmountForAll: 0 }
      );

    const thisMonthTotalTeamBusiness =
      withoutWithdrawAmountForAll - withdrawAmountForAll;

    // const skip = (page - 1) * limit;
    // const endIndex = skip + limit;

    const data = {
      thisMonthTotalTeamBusiness: thisMonthTotalTeamBusiness,
      businesses: filteredData.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),
    };

    return res.status(200).json({ data: data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const getAddressHistoryByAdmin = async (req, res) => {
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

    const addresses = await WalletAddress.paginate(queryFilter, options);

    if (downloadCSV) {
      const csvData = await WalletAddress.find(queryFilter);
      return res.status(200).json({ csv: csvData, data: addresses });
    }

    return res.status(200).json({ data: addresses });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const allMembersController = async (req, res) => {
  try {
    const page = parseInt(req?.query?.page) || 1;
    const pageSize = parseInt(req?.query?.limit) || 10;
    const searchById = req.query.searchById || "";
    const searchByStartDate = new Date(req.query.startDate).getTime() || "";
    const searchByEndDate = new Date(req.query.endDate).getTime() || "";
    const downloadCSV = req.query.csv || "";

    const matchStage = {
      $and: [
        searchById
          ? { userId: { $eq: searchById } }
          : { userId: { $ne: "admin" } },
        searchByStartDate && searchByEndDate
          ? {
              $or: [
                {
                  "joinDate.miliSec": {
                    $gte: searchByStartDate,
                    $lte: searchByEndDate,
                  },
                },
                {
                  joiningDate: new Date(searchByStartDate).toDateString(),
                },
              ],
            }
          : {},
      ],
    };

    const countPipeline = [
      {
        $addFields: {
          "joinDate.miliSec": { $toLong: { $toDate: "$joiningDate" } },
        },
      },
      { $match: matchStage },
      { $count: "totalDocs" },
    ];

    const dataPipeline = [
      {
        $addFields: {
          "joinDate.miliSec": { $toLong: { $toDate: "$joiningDate" } },
        },
      },
      { $match: matchStage },
      { $sort: { "joinDate.miliSec": -1 } },
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize },
      { $project: { team: 0, password: 0, token: 0, role: 0 } },
    ];

    const [countResult, dataResult] = await Promise.all([
      User.aggregate(countPipeline),
      User.aggregate(dataPipeline),
    ]);

    const totalItems = countResult.length > 0 ? countResult[0].totalDocs : 0;
    const totalPages = Math.ceil(totalItems / pageSize);
    const hasNextPage = page < totalPages;
    const nextPage = hasNextPage ? page + 1 : null;
    const hasPrevPage = page > 1;
    const prevPage = hasPrevPage ? page - 1 : null;
    const pagingCounter = (page - 1) * pageSize + 1;

    const response = {
      totalDocs: totalItems,
      limit: pageSize,
      totalPages: totalPages,
      page: page,
      pagingCounter: pagingCounter,
      hasPrevPage: hasPrevPage,
      hasNextPage: hasNextPage,
      prevPage: prevPage,
      nextPage: nextPage,
      docs: dataResult,
    };
    // Download CSV
    if (downloadCSV === "csv") {
      const result = await User.aggregate([
        {
          $addFields: {
            "joinDate.miliSec": { $toLong: { $toDate: "$joiningDate" } },
          },
        },
        { $match: matchStage },
        {
          $project: {
            _id: 0,
            team: 0,
            password: 0,
            token: 0,
            role: 0,
            deleteStatus: 0,
          },
        },
      ]);
      return res.status(200).json({ csv: result, data: response });
    }

    if (dataResult.length > 0) {
      return res.status(200).json({ data: response });
    } else {
      return res.status(400).json({ message: "There is no user" });
    }
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};

const activeUsersController = async (req, res) => {
  try {
    const page = parseInt(req?.query?.page) || 1;
    const pageSize = parseInt(req?.query?.limit) || 10;
    const searchById = req.query.searchById || "";
    const searchByStartDate = new Date(req.query.startDate).getTime() || "";
    const searchByEndDate = new Date(req.query.endDate).getTime() || "";
    const downloadCSV = req.query.csv || "";

    const matchStage = {
      $and: [
        { isActive: true },
        searchById
          ? { userId: { $eq: searchById } }
          : { userId: { $ne: "admin" } },
        searchByStartDate && searchByEndDate
          ? {
              $or: [
                {
                  "joinDate.miliSec": {
                    $gte: searchByStartDate,
                    $lte: searchByEndDate,
                  },
                },
                {
                  joiningDate: new Date(searchByStartDate).toDateString(),
                },
              ],
            }
          : {},
      ],
    };

    const countPipeline = [
      {
        $addFields: {
          "joinDate.miliSec": { $toLong: { $toDate: "$joiningDate" } },
        },
      },
      { $match: matchStage },
      { $count: "totalDocs" },
    ];

    const dataPipeline = [
      {
        $addFields: {
          "joinDate.miliSec": { $toLong: { $toDate: "$joiningDate" } },
        },
      },
      { $match: matchStage },
      { $sort: { "joinDate.miliSec": -1 } },
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize },
      { $project: { team: 0, password: 0, token: 0, role: 0 } },
    ];

    const [countResult, dataResult] = await Promise.all([
      User.aggregate(countPipeline),
      User.aggregate(dataPipeline),
    ]);

    const totalItems = countResult.length > 0 ? countResult[0].totalDocs : 0;
    const totalPages = Math.ceil(totalItems / pageSize);
    const hasNextPage = page < totalPages;
    const nextPage = hasNextPage ? page + 1 : null;
    const hasPrevPage = page > 1;
    const prevPage = hasPrevPage ? page - 1 : null;
    const pagingCounter = (page - 1) * pageSize + 1;

    const response = {
      totalDocs: totalItems,
      limit: pageSize,
      totalPages: totalPages,
      page: page,
      pagingCounter: pagingCounter,
      hasPrevPage: hasPrevPage,
      hasNextPage: hasNextPage,
      prevPage: prevPage,
      nextPage: nextPage,
      docs: dataResult,
    };
    // Download CSV
    if (downloadCSV === "csv") {
      const result = await User.aggregate([
        {
          $addFields: {
            "joinDate.miliSec": { $toLong: { $toDate: "$joiningDate" } },
          },
        },
        { $match: matchStage },
        {
          $project: {
            _id: 0,
            team: 0,
            password: 0,
            token: 0,
            role: 0,
            deleteStatus: 0,
          },
        },
      ]);
      return res.status(200).json({ csv: result, data: response });
    }

    if (dataResult.length > 0) {
      return res.status(200).json({ data: response });
    } else {
      return res.status(400).json({ message: "There is no user" });
    }
  } catch (error) {
    console.log({ error });
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};

const blockedUsersController = async (req, res) => {
  try {
    const page = parseInt(req?.query?.page) || 1;
    const pageSize = parseInt(req?.query?.limit) || 10;
    const searchById = req.query.searchById || "";
    const searchByStartDate = new Date(req.query.startDate).getTime() || "";
    const searchByEndDate = new Date(req.query.endDate).getTime() || "";
    const downloadCSV = req.query.csv || "";

    const matchStage = {
      $and: [
        { userStatus: false },
        searchById
          ? { userId: { $eq: searchById } }
          : { userId: { $ne: "admin" } },
        searchByStartDate && searchByEndDate
          ? {
              $or: [
                {
                  "joinDate.miliSec": {
                    $gte: searchByStartDate,
                    $lte: searchByEndDate,
                  },
                },
                {
                  joiningDate: new Date(searchByStartDate).toDateString(),
                },
              ],
            }
          : {},
      ],
    };

    const countPipeline = [
      {
        $addFields: {
          "joinDate.miliSec": { $toLong: { $toDate: "$joiningDate" } },
        },
      },
      { $match: matchStage },
      { $count: "totalDocs" },
    ];

    const dataPipeline = [
      {
        $addFields: {
          "joinDate.miliSec": { $toLong: { $toDate: "$joiningDate" } },
        },
      },
      { $match: matchStage },
      { $sort: { "joinDate.miliSec": -1 } },
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize },
      { $project: { team: 0, password: 0, token: 0, role: 0 } },
    ];

    const [countResult, dataResult] = await Promise.all([
      User.aggregate(countPipeline),
      User.aggregate(dataPipeline),
    ]);

    const totalItems = countResult.length > 0 ? countResult[0].totalDocs : 0;
    const totalPages = Math.ceil(totalItems / pageSize);
    const hasNextPage = page < totalPages;
    const nextPage = hasNextPage ? page + 1 : null;
    const hasPrevPage = page > 1;
    const prevPage = hasPrevPage ? page - 1 : null;
    const pagingCounter = (page - 1) * pageSize + 1;

    const response = {
      totalDocs: totalItems,
      limit: pageSize,
      totalPages: totalPages,
      page: page,
      pagingCounter: pagingCounter,
      hasPrevPage: hasPrevPage,
      hasNextPage: hasNextPage,
      prevPage: prevPage,
      nextPage: nextPage,
      docs: dataResult,
    };

    // Download CSV
    if (downloadCSV === "csv") {
      const result = await User.aggregate([
        {
          $addFields: {
            "joinDate.miliSec": { $toLong: { $toDate: "$joiningDate" } },
          },
        },
        { $match: matchStage },
        {
          $project: {
            _id: 0,
            team: 0,
            password: 0,
            token: 0,
            role: 0,
            deleteStatus: 0,
          },
        },
      ]);
      return res.status(200).json({ csv: result, data: response });
    }

    if (dataResult.length > 0) {
      return res.status(200).json({ data: response });
    } else {
      return res.status(400).json({ message: "There is no user" });
    }
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};

const createOtpForEditUserByAdminController = async (req, res) => {
  try {
    const userId = req.auth.id;

    const otpCode = Math.floor(1000 + Math.random() * 9000); // Generate OTP code
    const expireTime = new Date().getTime() + 300 * 1000; // create expire time

    const user = await User.findOne({ userId: userId });
    const email = user.email;

    const existingOtp = Otp.findOne({ email: email });

    if (existingOtp) {
      await Otp.deleteOne({ email: email });
    }

    const newOtp = await Otp.create({
      email: email,
      code: otpCode,
      expireIn: expireTime,
    });

    if (newOtp) {
      sendOtpMail("ridmalsa@gmail.com", newOtp.code);
      return res.status(200).json({
        message: "OTP sent on your email",
      });
    } else {
      return res.status(400).json({
        message: "Can not send OTP",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Something went wrong!",
    });
  }
};

const editUser = async (req, res) => {
  try {
    const otpCode = req.body.otpCode;

    if (!otpCode) {
      return res.status(400).json({ message: "OTP is required" });
    }

    const user = await User.findOne({ userId: req.auth.id });
    const otp = await Otp.findOne({ email: user.email });

    if (otp?.code !== otpCode) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const updatingUser = await User.findOne({ userId: req.body.userId });
    req.body.otpCode = undefined;

    const updatedUser = await User.findOneAndUpdate(
      { userId: req.body.userId },
      { $set: req.body },
      { new: true }
    );

    const ISTTime = await getIstTimeWithInternet();

    await WalletAddress.create({
      userId: updatedUser.userId,
      fullName: updatedUser.fullName,
      previousAddress: updatingUser.walletAddress
        ? updatingUser.walletAddress
        : "N/A",
      currentAddress: updatedUser.walletAddress,
      updatedBy: user.userId,
      date: new Date(
        ISTTime?.date ? ISTTime?.date : getIstTime().date
      ).toDateString(),
      time: ISTTime?.time ? ISTTime?.time : getIstTime().time,
    });

    await Otp.deleteOne({ email: user.email });

    if (!updatedUser) {
      return res.status(404).json({ message: "Can not Update User" });
    }

    return res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// change user Status
const changeUserStatus = async (req, res) => {
  try {
    const { user_id } = req.body;
    const user = await User.findOne({ userId: user_id });
    const updateUserStatus = await User.findOneAndUpdate(
      { userId: user_id },
      {
        $set: {
          userStatus: !user.userStatus,
        },
      }
    );
    if (updateUserStatus) {
      res.status(200).json({
        message: "Successfully changed user Status",
      });
    } else {
      res.status(400).json({
        message: "Cannot change user status",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// Member delete
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findOneAndUpdate(
      { userId: userId },
      {
        $set: {
          deleteStatus: true,
        },
      }
    );
    if (user) {
      res.status(200).json({
        message: "Deleted successfully",
      });
    } else {
      res.status(400).json({
        message: "Cannot delete user",
      });
    }
  } catch (error) {
    res.status(400).json({
      message: error.toString(),
    });
  }
};

// Team Statistics
const getTeamStatistics = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const userInfo = await User.findOne({ userId });

    if (!userInfo) {
      return res.status(400).json({ message: "User is not found" });
    }
    const existRank = await RankIncome.findOne({ userId }).sort({
      createdAt: -1,
    });

    const teamMembers = userInfo.team || [];

    const totalActiveTeam = await User.countDocuments({
      userId: { $in: teamMembers.map((member) => member.userId) },
      isActive: true,
    });

    const levelInfo = [];
    const findLevel = await Level.findOne({ userId: userId });

    let allTeamBusinessAmount = 0;
    for (let i = 1; i <= 5; i++) {
      const levels = findLevel?.level?.filter((d) => d.level === `${i}`) || [];
      const totalTeam = +levels?.length; // total Team

      // Get total business of level [i]
      let totalBusinessAmount = 0;
      let activeTeamCount = 0;
      for (const singleLevel of levels) {
        const activeUser = await User.countDocuments({
          userId: singleLevel?.userId,
          isActive: true,
        });

        if (activeUser) {
          const latestPackageAmount = await PackageBuyInfo.aggregate([
            {
              $match: {
                userId: singleLevel?.userId,
              },
            },
            {
              $sort: { createdAt: -1 }, // Sort by createdAt in descending order
            },
            {
              $limit: 1, // Limit to the first result (latest)
            },
            {
              $group: {
                _id: "$userId",
                totalAmount: { $last: "$packageInfo.amount" }, // Get the amount from the last document in each user group
              },
            },
            {
              $group: {
                _id: null,
                totalAmount: { $sum: "$totalAmount" },
              },
            },
          ]);

          activeTeamCount += await User.countDocuments({
            userId: singleLevel?.userId,
            isActive: true,
          });

          if (
            latestPackageAmount.length > 0 &&
            latestPackageAmount[0].totalAmount !== undefined
          ) {
            totalBusinessAmount += latestPackageAmount[0].totalAmount;
          }
        }
      }
      allTeamBusinessAmount += totalBusinessAmount;
      const data = {
        level: i,
        totalTeam: totalTeam,
        totalBusinessAmount: totalBusinessAmount,
        activeTeamCount,
      };
      levelInfo.push(data);
    }

    const distributorLvl =
      findLevel.level?.filter((d) => d.level === "1") || [];
    console.log("Filtered Level 1 Users:", distributorLvl);

    let allLine = await Promise.all(
      distributorLvl.map(async (user) =>
        CalculateLinePackageAmount(user.userId)
      )
    );

    allLine.sort((a, b) => b.totalInvestmentAmount - a.totalInvestmentAmount);
    console.log("Calculated Line Packages (Sorted):", allLine);
    const walletInfo = await Wallet.findOne({ userId });

    const withdrawalInfo = await Withdraw.aggregate([
      {
        $match: { userId: userId, status: { $in: ["success", "pending"] } },
      },
      {
        $group: {
          _id: null,
          totalWithdraw: { $sum: "$requestAmount" },
        },
      },
    ]);

    const levelUsers = await Level.aggregate([
      {
        $match: {
          userId: userId,
        },
      },
      {
        $project: {
          _id: 0,
          userId: {
            $filter: {
              input: "$level",
              as: "level",
              cond: {},
            },
          },
        },
      },
      {
        $unwind: "$userId",
      },
      {
        $lookup: {
          from: "users",
          localField: "userId.userId",
          foreignField: "userId",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $match: {
          "userDetails.isActive": true,
        },
      },
      {
        $group: {
          _id: null,
          userIds: {
            $push: {
              userId: "$userId.userId",
              level: "$userId.level",
            },
          },
        },
      },
    ]);

    const user = await User.findOne({ userId: userId });
    const rankIncomeCurrentDate = user?.rankIncomeCurrentDateString;

    const info = {
      fullName: userInfo.fullName,
      rank: userInfo.rank,
      package: userInfo.packageInfo?.amount,
      totalTeam: teamMembers.length,
      totalActiveTeam,
      teamStats: levelInfo,
      activeIncome: walletInfo.activeIncome,
      totalIncome: walletInfo.totalIncome,
      roiIncome: walletInfo.roiIncome,
      levelIncome: walletInfo.levelIncome,
      rankIncome: walletInfo.rankIncome,
      rewardIncome: walletInfo.rewardIncome,
      depositBalance: walletInfo.depositBalance,
      profitSharingIncome: walletInfo.profitSharingIncome,
      eWallet: walletInfo.eWallet,
      profitWallet: walletInfo.profitWallet,
      bonusIncome: walletInfo.rankBonusIncome,
      totalWithdraw: withdrawalInfo[0]?.totalWithdraw || 0,
      allLine,
    };

    if (info) {
      return res.status(200).json({ message: "Data retrieved", data: info });
    } else {
      return res.status(400).json({ message: "There is no data" });
    }
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Get level details
const getTeamStatsDetails = async (req, res) => {
  try {
    const { level, userId, page, searchById, startDate, endDate } = req.query;
    const limit = parseInt(req.query.limit) || 10;
    if (!level || parseInt(level) > 7 || !userId) {
      return res.status(400).json({ message: "Invalid input parameters" });
    }

    const matchStage = {
      $match: { userId: userId },
    };

    const levelStage = {
      $match: {
        $and: [level ? { "level.level": level } : {}],
      },
    };

    if (level === "allLevel") {
      levelStage.$match = {};
    }

    const searchByStartDate = startDate ? new Date(startDate).getTime() : null;
    const searchByEndDate = endDate ? new Date(endDate).getTime() : null;

    const historyPipeline = [
      matchStage,
      { $unwind: "$level" },
      levelStage,
      {
        $lookup: {
          from: "packagebuyinfos",
          localField: "level.userId",
          foreignField: "userId",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $addFields: {
          "userDetails.packageInfo.dateMilliseconds": {
            $toLong: { $toDate: "$userDetails.packageInfo.date" },
          },
        },
      },
      {
        $match: {
          $and: [
            searchById ? { "userDetails.userId": searchById } : {},
            searchByStartDate && searchByEndDate
              ? {
                  $or: [
                    {
                      "userDetails.packageInfo.dateMilliseconds": {
                        $gte: searchByStartDate,
                        $lte: searchByEndDate,
                      },
                    },
                    {
                      "userDetails.packageInfo.date": new Date(
                        searchByStartDate
                      ).toDateString(),
                    },
                  ],
                }
              : {},
          ],
        },
      },
      { $sort: { "userDetails.createdAt": -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          userId: "$userDetails.userId",
          fullName: "$userDetails.userFullName",
          sponsorId: "$userDetails.sponsorId",
          sponsorName: "$userDetails.sponsorName",
          packageInfo: {
            amount: "$userDetails.packageInfo.amount",
            date: "$userDetails.packageInfo.date",
            time: "$userDetails.packageInfo.time",
          },
          packageType: "$userDetails.packageType",
          level: "$level.level",
        },
      },
    ];

    const history = await Level.aggregate(historyPipeline);

    // const activeUser = await User.countDocuments({
    //   userId: singleLevel?.userId,
    //   isActive: true,
    // });

    const totalDocsPipeline = [
      matchStage,
      { $unwind: "$level" },
      levelStage,
      {
        $lookup: {
          from: "packagebuyinfos",
          localField: "level.userId",
          foreignField: "userId",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $addFields: {
          "userDetails.packageInfo.dateMilliseconds": {
            $toLong: { $toDate: "$userDetails.packageInfo.date" },
          },
        },
      },
      {
        $lookup: {
          from: "users", // Assuming "User" collection name is "users"
          localField: "userDetails.userId", // Field to match in "User" collection
          foreignField: "userId", // Assuming userId in "User" collection is stored as _id
          as: "userInfo", // Alias for the joined documents from "User" collection
        },
      },
      { $unwind: "$userInfo" }, // Unwind the joined documents
      {
        $match: {
          $and: [
            { "userInfo.isActive": true }, // Consider only active users
            searchById ? { "userDetails.userId": searchById } : {},
            searchByStartDate && searchByEndDate
              ? {
                  $or: [
                    {
                      "userDetails.packageInfo.dateMilliseconds": {
                        $gte: searchByStartDate,
                        $lte: searchByEndDate,
                      },
                    },
                    {
                      "userDetails.packageInfo.date": new Date(
                        searchByStartDate
                      ).toDateString(),
                    },
                  ],
                }
              : {},
          ],
        },
      },
      { $sort: { "userDetails.createdAt": -1 } },
      {
        $group: {
          _id: "$userDetails.userId",
          totalAmount: { $first: "$userInfo.packageInfo.amount" }, // Fetch amount from "User" collection
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: "$count" },
          totalAmount: { $sum: "$totalAmount" },
          // activeUserCount: { $first: activeUser }, // Add count of active users to the result
        },
      },
    ];

    const [totalItemsData] = await Level.aggregate(totalDocsPipeline);
    // console.log(totalItemsData);
    const totalItems = totalItemsData ? totalItemsData.count : 0;
    const totalAmount = totalItemsData ? totalItemsData.totalAmount : 0;
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const nextPage = hasNextPage ? page + 1 : null;
    const pagingCounter = (page - 1) * limit + 1;

    const response = {
      totalDocs: totalItems,
      limit: limit,
      totalPages: totalPages,
      totalAmount,
      page: page,
      pagingCounter: pagingCounter,
      hasPrevPage: page > 1,
      hasNextPage: hasNextPage,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: nextPage,
      data: history,
    };

    if (history.length > 0) {
      return res.status(200).json(response);
    } else {
      return res.status(400).json({ message: "There is no history" });
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Something went wrong" });
  }
};

const getUpgradeTeamStatsDetails = async (req, res) => {
  try {
    //? In production ........................
    const level = req.query.level;
    const userId = req.query.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchById = req.query.searchById || null;
    const startDate = new Date(req?.query?.startDate).toDateString();
    const endDate = new Date(req?.query?.endDate).toDateString();
    const downloadCSV = req.query.csv || "";

    let levelQueryFilter = {
      $or: [{ $eq: ["$$level.level", level] }],
    };

    if (level === "allLevel") {
      levelQueryFilter = {};
    }

    if (searchById && level !== "allLevel") {
      levelQueryFilter = {
        $and: [
          { $eq: ["$$level.userId", searchById] },
          { $eq: ["$$level.level", level] },
        ],
      };
    } else if (searchById && level === "allLevel") {
      levelQueryFilter = {
        $and: [{ $eq: ["$$level.userId", searchById] }],
      };
    }

    const levelUsers = await Level.aggregate([
      {
        $match: {
          userId: userId,
        },
      },
      {
        $project: {
          _id: 0,
          userId: {
            $filter: {
              input: "$level",
              as: "level",
              cond: levelQueryFilter,
            },
          },
        },
      },
      {
        $unwind: "$userId",
      },
      {
        $group: {
          _id: null,
          userIds: { $push: "$userId.userId" },
        },
      },
    ]);

    let queryFilter = {
      userId: {
        $in: levelUsers[0]?.userIds.map((id) => id) || [],
      },
      // $or: [
      //   { packageType: "Buy" },
      //   { packageType: "Upgrade" },
      //   { packageType: "Withdraw IA" },
      // ],
      // packageType: { $ne: "Withdraw IA" },
    };

    if (!startDate.includes("Invalid") && !endDate.includes("Invalid")) {
      const dateFilter = {
        "packageInfo.date": {
          $in: getDatesInRange(startDate, endDate),
        },
      };
      queryFilter = { ...queryFilter, ...dateFilter };
    }

    const options = {
      page: page,
      limit: limit,
      sort: { createdAt: -1 },
    };

    const upgradedAmount = await PackageBuyInfo.aggregate([
      { $match: queryFilter },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAmount: { $sum: "$upgradedAmount" },
        },
      },
    ]);
    const totalUpgradedAmount = upgradedAmount.length
      ? upgradedAmount[0].totalAmount
      : 0;

    // We are not deducting until the withdraw IA is not created and the withdraw IA will create after the withdraw status got success.
    const withdrawalAmount = await PackageBuyInfo.aggregate([
      { $match: { ...queryFilter, packageType: "Withdraw IA" } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAmount: { $sum: "$packageInfo.amount" },
        },
      },
    ]);
    const totalWithdrawalAmount = withdrawalAmount.length
      ? withdrawalAmount[0].totalAmount
      : 0;

    const totalAmount = totalUpgradedAmount - totalWithdrawalAmount;

    const data = await PackageBuyInfo.paginate(queryFilter, options);
    data.totalAmount = totalAmount;

    //^ Testing...........
    // data.docs = data.docs.map(async (d) => {
    //   const matchedLevel = await Level.aggregate([
    //     { $unwind: "$level" },
    //     {
    //       $match: {
    //         "level.userId": d.userId,
    //         "level.sponsorId": d.sponsorId
    //       }
    //     },
    //     {
    //       $project: {
    //         level: 1,
    //         _id: 0  // Exclude the top-level document _id
    //       }
    //     }
    //   ]);
    //   console.log(console.log(matchedLevel[0].level.level);)
    // });

    //? In production .........
    if (downloadCSV) {
      const csvData = await PackageBuyInfo.find(queryFilter);
      return res.status(200).json({ csv: csvData, data: data });
    }
    return res.status(200).json({ data: data });

    //! Data Manipulation codes
    // const users = await User.find({ userId: { $ne: "admin" } });

    // for (const user of users) {
    //   const arr = [];
    //   const packagesOfAnUser = await PackageBuyInfo.find({
    //     userId: user.userId,
    //     $or: [{ packageType: "Buy" }, { packageType: "Upgrade" }],
    // //     packageType: { $ne: "Withdraw IA" },
    //   }).sort({ createdAt: 1 });
    //   for (const pg of packagesOfAnUser) {
    //     const plainObj = pg.toObject();
    //     if (plainObj.packageType === "Buy") {
    //       arr.push({
    //         ...plainObj,
    //         upgradedAmount: plainObj.packageInfo.amount,
    //       });
    //     } else {
    //       const element = arr[arr.length - 1];
    //       arr.push({
    //         ...plainObj,
    //         upgradedAmount:
    //           plainObj.packageInfo.amount - element.packageInfo.amount,
    //       });
    //     }
    //   }
    //   for (const data of arr) {
    //     const find = await PackageBuyInfo.findOneAndUpdate(
    //       { _id: data._id },
    //       data,
    //       { new: true }
    //     );
    //   }
    //   console.log(user.userId, "Completed for this");
    // }

    // return res.status(200).json({ message: "Completed" });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Something went wrong" });
  }
};

const getAllPin = async (req, res) => {
  try {
    const page = parseInt(req?.query?.page) || 1;
    const pageSize = parseInt(req?.query?.limit) || 10;
    const searchById = req.query.searchById || "";
    const downloadCSV = req.query.csv || "";

    const queryFilter = {};

    if (searchById) {
      queryFilter.userId = searchById;
    }
    const options = {
      page: page,
      limit: pageSize,
      sort: { createdAt: -1 }, // Sorting by _id in descending order
    };

    const allPins = await Pin.paginate(queryFilter, options);
    // Download CSV
    if (downloadCSV === "csv") {
      const result = await Pin.find(queryFilter);
      return res.status(200).json({ csv: result, allPins });
    }

    if (allPins?.docs?.length > 0) {
      return res.status(200).json({ message: "Request Successful", allPins });
    } else {
      return res.status(404).json({ message: "No pins found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const getAllKYCController = async (req, res) => {
  try {
    const page = parseInt(req?.query?.page) || 1;
    const pageSize = parseInt(req?.query?.limit) || 10;
    const searchById = req.query.searchById || "";
    const searchByStartDate = new Date(req.query.startDate).getTime() || "";
    const searchByEndDate = new Date(req.query.endDate).getTime() || "";

    const matchStage = {
      $and: [
        searchById ? { userId: { $eq: searchById } } : {},
        searchByStartDate && searchByEndDate
          ? {
              $or: [
                {
                  "date.miliSec": {
                    $gte: searchByStartDate,
                    $lte: searchByEndDate,
                  },
                },
                {
                  submissionDate: new Date(searchByStartDate).toDateString(),
                },
              ],
            }
          : {},
      ],
    };

    const countPipeline = [
      {
        $addFields: {
          "date.miliSec": { $toLong: { $toDate: "$submissionDate" } },
        },
      },
      { $match: matchStage },
      { $count: "totalDocs" },
    ];

    const dataPipeline = [
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize },
    ];

    const [countResult, dataResult] = await Promise.all([
      Kyc.aggregate(countPipeline),
      Kyc.aggregate(dataPipeline),
    ]);

    const totalItems = countResult.length > 0 ? countResult[0].totalDocs : 0;
    const totalPages = Math.ceil(totalItems / pageSize);
    const hasNextPage = page < totalPages;
    const nextPage = hasNextPage ? page + 1 : null;
    const hasPrevPage = page > 1;
    const prevPage = hasPrevPage ? page - 1 : null;
    const pagingCounter = (page - 1) * pageSize + 1;

    const response = {
      totalDocs: totalItems,
      limit: pageSize,
      totalPages: totalPages,
      page: page,
      pagingCounter: pagingCounter,
      hasPrevPage: hasPrevPage,
      hasNextPage: hasNextPage,
      prevPage: prevPage,
      nextPage: nextPage,
      docs: dataResult,
    };

    if (dataResult.length > 0) {
      return res.status(200).json({ data: response });
    } else {
      return res.status(400).json({ message: "There is no user" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};
const updateKycController = async (req, res) => {
  try {
    const result = await Kyc.findOneAndUpdate(
      { _id: req.body.id, userId: req.body.userId, status: "pending" },
      { $set: { status: req.body.status } },
      { new: true } // Return the updated document
    );

    if (result) {
      return res.status(200).json({ message: "KYC updated" });
    } else {
      return res
        .status(403)
        .json({ message: "KYC update not possible", data: null });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", data: null });
  }
};

const updateUserWalletInfo = async (req, res) => {
  try {
    const { bankName, accountTitle, accountNumber, branchName, userId } =
      req.body;

    console.log(req.body);
    // Validate request data
    if (!bankName) {
      return res.status(400).json({ message: "Bank Name is missing" });
    }

    if (!accountTitle) {
      return res.status(400).json({ message: "Account Title is missing" });
    }

    if (!accountNumber) {
      return res
        .status(400)
        .json({ message: "Account Number IBAN is Missing" });
    }

    if (!branchName) {
      return res.status(400).json({ message: "Branch Name is missing" });
    }

    // Find the user
    const user = await User.findOne({ userId });

    // Update or create the Pin record
    const walletData = {
      userId,
      fullName: user.fullName,
      bankName,
      accountTitle,
      accountNoIBAN: accountNumber,
      branchCode: branchName,
    };

    const userPin = await WalletAddress.findOneAndUpdate(
      { userId },
      { $set: walletData },
      { upsert: true }
    );

    return res.status(200).json({ message: "Wallet Update successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  findThisMonthTotalTeamBusiness,
  createOtpForEditUserByAdminController,
  getAddressHistoryByAdmin,
  getUpgradeTeamStatsDetails,
  activeUsersController,
  blockedUsersController,
  editUser,
  allMembersController,
  changeUserStatus,
  deleteUser,
  getTeamStatistics,
  getTeamStatsDetails,
  getAllPin,
  getAllKYCController,
  updateKycController,
  updateUserWalletInfo,
};
