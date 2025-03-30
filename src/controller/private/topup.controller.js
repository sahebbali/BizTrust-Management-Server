const getDatesInRange = require("../../config/getDatesInRange");
const getIstTime = require("../../config/getTime");
const { getIstTimeWithInternet } = require("../../config/internetTime");
const User = require("../../models/auth.model");
const { PackageBuyInfo } = require("../../models/topup.model");
const Wallet = require("../../models/wallet.model");
const levelIncome = require("../../utils/levelIncome");
const rewardIncome = require("../../utils/rewardIncome");
const {
  processPackageAction,
  processAdminPackageAction,
} = require("../../utils/topupPackage");
const { updatePackageAmount } = require("../../utils/updatePackageAmount");

const getTopupHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchById = req.query.searchById || null;
    const startDate = new Date(req?.query?.startDate).toDateString();
    const endDate = new Date(req?.query?.endDate).toDateString();
    const downloadCSV = req.query.csv || "";
    const status = req.query.status || "";
    console.log({ status });
    const queryFilter = {};

    if (searchById) {
      queryFilter.userId = searchById;
    }

    if (!startDate.includes("Invalid") && !endDate.includes("Invalid")) {
      queryFilter["packageInfo.date"] = {
        $in: getDatesInRange(startDate, endDate),
      };
    }

    const options = {
      page: page,
      limit: limit,
      sort: { createdAt: -1 },
    };

    const total = await PackageBuyInfo.aggregate([
      {
        $match: queryFilter,
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$packageAmount" },
        },
      },
    ]);

    const packageInfos = await PackageBuyInfo.paginate(queryFilter, options);
    packageInfos.totalAmount = total[0]?.totalAmount || 0;

    if (downloadCSV) {
      const csvData = await PackageBuyInfo.find(queryFilter);
      return res.status(200).json({ csv: csvData, data: packageInfos });
    }

    return res.status(200).json({ data: packageInfos });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
const getTopupByStatusHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchById = req.query.searchById || null;
    const startDate = new Date(req?.query?.startDate).toDateString();
    const endDate = new Date(req?.query?.endDate).toDateString();
    const downloadCSV = req.query.csv || "";
    const status = req.query.status || "";
    console.log({ status });
    const queryFilter = {
      status,
    };

    if (searchById) {
      queryFilter.userId = searchById;
    }

    if (!startDate.includes("Invalid") && !endDate.includes("Invalid")) {
      queryFilter["packageInfo.date"] = {
        $in: getDatesInRange(startDate, endDate),
      };
    }

    const options = {
      page: page,
      limit: limit,
      sort: { createdAt: -1 },
    };

    const total = await PackageBuyInfo.aggregate([
      {
        $match: queryFilter,
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$packageAmount" },
        },
      },
    ]);

    const packageInfos = await PackageBuyInfo.paginate(queryFilter, options);
    packageInfos.totalAmount = total[0]?.totalAmount || 0;

    if (downloadCSV) {
      const csvData = await PackageBuyInfo.find(queryFilter);
      return res.status(200).json({ csv: csvData, data: packageInfos });
    }

    return res.status(200).json({ data: packageInfos });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const createTopupController = async (req, res) => {
  try {
    // Get the current Pakistan Standard Time (PST)
    const ISTTime = await getIstTimeWithInternet();
    const dateStringToCheck = new Date(
      ISTTime?.date || getIstTime().date
    ).toDateString();

    const { userId, amount, type } = req.body;
    const packageAmount = amount;
    console.log({ packageAmount, type });
    console.log(req.body);

    const currentUser = await User.findOne({
      userId,
    });
    if (!currentUser) {
      return res.status(400).json({
        message: `User Not Found`,
      });
    }
    if (!type) {
      return res.status(400).json({
        message: `Type are Required`,
      });
    }

    if (packageAmount < 100000) {
      return res
        .status(400)
        .json({ message: "Minimum package amount is Rs 100000" });
    }

    // Fetch the latest package buy info for the user
    const extPackageBuyInfo = await PackageBuyInfo.findOne({
      userId,
    }).sort({ createdAt: -1 });

    if (extPackageBuyInfo && packageAmount <= extPackageBuyInfo.packageAmount) {
      return res.status(400).json({
        message: `You can only buy a package larger than Rs ${extPackageBuyInfo.packageAmount}`,
      });
    }

    // Calculate the start date in PST
    const startDate = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi" })
    );

    console.log(startDate);
    // Add 48 hours to the start date
    startDate.setTime(startDate.getTime() + 48 * 60 * 60 * 1000); // 48 hours in milliseconds
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(startDateObj);
    endDateObj.setFullYear(endDateObj.getFullYear() + 2); // Add 2 years to the start date

    const createPackage = await PackageBuyInfo.create({
      userId: currentUser.userId,
      userFullName: currentUser.fullName,
      sponsorId: currentUser.sponsorId,
      sponsorName: currentUser.sponsorName,
      packageId:
        Date.now().toString(36) + Math.random().toString(36).substring(2),
      packageAmount: packageAmount,
      packageLimit: packageAmount * 2,
      date: new Date(getIstTime().date).toDateString(),
      time: getIstTime().time,
      packageType: "Gift",
      isActive: true,
      status: "success",
      isFirstROI: type === "ROIFree" ? false : true,
      isROIFree: type === "ROIFree" ? true : false,
      isAdmin: true,
      startDate: startDateObj.toDateString(), // Use the formatted start date
      startDateInt: startDateObj.getTime(), // Use timestamp for startDateInt
      endDate: endDateObj.toDateString(), // Use the formatted end date
      endDateInt: endDateObj.getTime(), // Use timestamp for endDateInt
    });

    await updatePackageAmount(
      createPackage?.userId,
      createPackage?.packageAmount
    );
    await levelIncome(createPackage.userId, createPackage.packageAmount);
    await rewardIncome(createPackage?.sponsorId);
    if (createPackage) {
      return res.status(201).json({ message: "Package Create Successfully" });
    }
    // Process package activation
    // await processAdminPackageAction(userId, packageAmount, startDate, true);

    return res.status(201).json({ message: "Package Activated Successfully" });
  } catch (error) {
    console.error("Error in createTopupController:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
const updateTopUpStatus = async (req, res) => {
  try {
    const { userId, packageId, status } = req.body;

    const extUser = await User.findOne({
      userId,
    });
    if (!extUser) {
      return res.status(400).json({
        message: `User Not Found`,
      });
    }
    if (status === "pending") {
      return;
    }
    // Fetch the latest package buy info for the user
    const extPackageBuyInfo = await PackageBuyInfo.findOne({
      packageId,
      status: "pending",
    }).sort({ createdAt: -1 });

    if (extPackageBuyInfo) {
      await PackageBuyInfo.findOneAndUpdate(
        {
          packageId,
        },
        { $set: { status } }
      );
    } else {
      return res.status(400).json({
        message: `Package Not Found!`,
      });
    }
    // Calculate the start date in PST
    if (status === "success") {
      const startDate = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi" })
      );

      // Add 48 hours to the start date
      startDate.setTime(startDate.getTime() + 48 * 60 * 60 * 1000); // 48 hours in milliseconds
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(startDateObj);
      endDateObj.setFullYear(endDateObj.getFullYear() + 2); // Add 2 years to the start date

      const updatePackage = await PackageBuyInfo.findOneAndUpdate(
        {
          packageId,
        },
        {
          isActive: true,
          startDate: startDateObj.toDateString(), // Use the formatted start date
          startDateInt: startDateObj.getTime(), // Use timestamp for startDateInt
          endDate: endDateObj.toDateString(), // Use the formatted end date
          endDateInt: endDateObj.getTime(), // Use timestamp for endDateInt
        }
      );
      await updatePackageAmount(
        extPackageBuyInfo?.userId,
        extPackageBuyInfo?.packageAmount
      );
      await levelIncome(updatePackage.userId, updatePackage.packageAmount);
      await rewardIncome(updatePackage?.sponsorId);

      return res
        .status(201)
        .json({ message: "Package Activated Successfully" });
    } else {
      await Wallet.findOneAndUpdate(
        { userId: userId },
        { $inc: { depositBalance: +extPackageBuyInfo?.packageAmount } },
        { new: true }
      );
      return res.status(400).json({ message: "Package Rejected" });
    }
  } catch (error) {
    console.error("Error in Update Topup Controller:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  getTopupHistory,
  getTopupByStatusHistory,
  createTopupController,
  updateTopUpStatus,
};
