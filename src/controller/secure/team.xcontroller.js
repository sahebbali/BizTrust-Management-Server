const User = require("../../models/auth.model");
const Level = require("../../models/level.model");
const { PackageBuyInfo } = require("../../models/topup.model");
const Wallet = require("../../models/wallet.model");

// get level team
const getLevelTeam = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const level = req.query.level;

    const matchStage = {
      $match: {
        userId: req.auth.id,
      },
    };
    const levelStage = {
      $match: {
        $and: [level ? { "level.level": level } : {}],
      },
    };

    const histories = await Level.aggregate([
      matchStage,
      { $unwind: "$level" },
      levelStage,
      {
        $set: {
          "level.dateMilliseconds": {
            $toDate: "$level.joiningDate",
          },
        },
      },
      { $sort: { "level.dateMilliseconds": -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "level.userId",
          foreignField: "userId",
          as: "userDetails",
        },
      },
      {
        $project: {
          _id: 0,
          userId: "$level.userId",
          fullName: "$level.fullName",
          sponsorId: "$level.sponsorId",
          sponsorName: "$level.sponsorName",
          joiningDate: "$level.joiningDate",
          level: "$level.level",
          activationDate: { $arrayElemAt: ["$userDetails.activationDate", 0] },
        },
      },
    ]);

    const totalHistoryPipleine = [
      matchStage,
      { $unwind: "$level" },
      levelStage,
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ];

    const totalHistories = await Level.aggregate(totalHistoryPipleine);

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
        message: "Retrieved the level history",
        data: response,
      });
    } else {
      return res.status(400).json({ message: "Level history is empty" });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
// Get Direct Level Team
const getDirectLevelTeam = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    console.log(req.auth.id);

    const histories = await Level.aggregate([
      { $unwind: "$level" }, // Unwind before matching levels
      {
        $match: {
          userId: req.auth.id,
          "level.level": "1", // Filter only level 1 data
        },
      },
      {
        $set: {
          "level.dateMilliseconds": {
            $toDate: "$level.joiningDate", // Convert joiningDate to a date object
          },
        },
      },
      { $sort: { "level.dateMilliseconds": -1 } }, // Sort by date
      { $skip: (page - 1) * limit }, // Pagination
      { $limit: limit }, // Limit results per page
      {
        $lookup: {
          from: "users",
          localField: "level.userId",
          foreignField: "userId",
          as: "userDetails", // Lookup additional user details
        },
      },
      {
        $project: {
          _id: 0,
          userId: "$level.userId",
          fullName: "$level.fullName",
          sponsorId: "$level.sponsorId",
          sponsorName: "$level.sponsorName",
          joiningDate: "$level.joiningDate",
          activationDate: { $arrayElemAt: ["$userDetails.activationDate", 0] },
        },
      },
    ]);

    const totalHistoryPipleine = [
      { $unwind: "$level" },
      {
        $match: {
          userId: req.auth.id,
          "level.level": "1", // Ensure we're counting only level 1 entries
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 }, // Count the number of matching records
        },
      },
    ];

    const totalHistories = await Level.aggregate(totalHistoryPipleine);

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
        message: "Retrieved the level history",
        data: response,
      });
    } else {
      return res.status(400).json({ message: "Level history is empty" });
    }
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// Get level business
// const getLevelBusiness = async (req, res) => {
//   try {
//     const pipeline = [
//       {
//         $match: { userId: req.auth.id },
//       },
//       {
//         $unwind: "$level",
//       },
//       {
//         $group: {
//           _id: "$level.level",
//           levels: { $push: "$level" },
//         },
//       },
//       {
//         $sort: { _id: 1 },
//       },
//       {
//         $project: {
//           level: "$_id",
//           totalTeam: { $size: "$levels" },
//           userIds: "$levels.userId",
//         },
//       },
//       {
//         $lookup: {
//           from: "packagebuyinfos",
//           localField: "userIds",
//           foreignField: "userId",
//           as: "packages",
//         },
//       },
//       {
//         $addFields: {
//           latestPackage: {
//             $arrayElemAt: [
//               {
//                 $slice: [
//                   {
//                     $map: {
//                       input: "$packages",
//                       as: "pkg",
//                       in: "$$pkg.packageInfo.amount",
//                     },
//                   },
//                   -1,
//                 ],
//               },
//               0,
//             ],
//           },
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "userIds",
//           foreignField: "userId",
//           as: "users",
//         },
//       },
//       {
//         $addFields: {
//           isActiveArray: "$users.isActive",
//         },
//       },
//       {
//         $unwind: "$isActiveArray",
//       },
//       {
//         $group: {
//           _id: "$level",
//           totalBusinessAmount: { $sum: "$latestPackage" },
//           activeTeamCount: {
//             $sum: { $cond: [{ $eq: ["$isActiveArray", true] }, 1, 0] },
//           },
//           totalTeam: { $first: "$totalTeam" },
//         },
//       },
//       {
//         $sort: { _id: 1 },
//       },
//     ];

//     const levelInfo = await Level.aggregate(pipeline);

//     if (levelInfo.length > 0) {
//       return res.status(200).json({ data: levelInfo });
//     } else {
//       return res.status(400).json({ message: "There is no history" });
//     }
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Something went wrong" });
//   }
// };

const CalculateLinePackageAmount = async (userId) => {
  try {
    // Find the document for the specified userId
    const levels = await Level.findOne({ userId }); // Assuming one document per userId

    const distributorLvl = levels?.level?.filter((d) => d?.userId);

    const userIds = distributorLvl?.map((d) => d.userId) || [];
    userIds.push(userId);
    console.log("User Id Array: ", userIds);
    const [investmentData] = await Wallet.aggregate([
      {
        $match: {
          userId: { $in: userIds }, // Filter by userIds
        },
      },
      {
        $group: {
          _id: null,
          totalInvestmentAmount: { $sum: "$investmentAmount" }, // Sum of investment amounts
          userCount: { $sum: 1 }, // Count the number of users
        },
      },
    ]);

    // Prepare result
    const result = {
      totalInvestmentAmount: investmentData?.totalInvestmentAmount || 0,
      userCount: investmentData?.userCount || 0,
      rootLine: userId,
    };

    console.log("Result: ", result);
    return result; // Return the result
  } catch (error) {
    console.log("Level Error", error);
    throw error; // Re-throw the error to handle it at a higher level
  }
};
const getLevelBusiness = async (req, res) => {
  try {
    const userId = req.auth.id;
    const findLevel = await Level.findOne({ userId: userId });
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
    if (allLine?.length > 0) {
      return res.status(200).json({ data: allLine });
    } else {
      return res.status(400).json({ message: "There is no Line" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { getLevelTeam, getDirectLevelTeam, getLevelBusiness };
