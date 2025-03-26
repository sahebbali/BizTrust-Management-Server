const { topUpPackageAmount } = require("../../constants/topup.constants");
const User = require("../../models/auth.model");
const { PackageBuyInfo, PackageRoi } = require("../../models/topup.model");
const Wallet = require("../../models/wallet.model");
const { ThisMonthTeamBusiness } = require("../../utils/thisMonthTeamBusniess");
const {
  processPackageAction,
  topupWalletUpdate,
} = require("../../utils/topupPackage");
const { getIstTimeWithInternet } = require("../../config/internetTime");
const getIstTime = require("../../config/getTime");

const createTopupController = async (req, res) => {
  try {
    // Get the current Pakistan Standard Time (PST)
    const ISTTime = await getIstTimeWithInternet();
    const dateStringToCheck = new Date(
      ISTTime?.date || getIstTime().date
    ).toDateString();
    const isWeekend =
      dateStringToCheck.includes("Sat") || dateStringToCheck.includes("Sun");

    const { packageAmount, type } = req.body;
    console.log({ packageAmount, type });
    console.log(req.body);

    if (!packageAmount || packageAmount < 100000) {
      return res
        .status(400)
        .json({ message: "Minimum package amount is Rs 100000" });
    }

    // Fetch the latest package buy info for the user
    const extPackageBuyInfo = await PackageBuyInfo.findOne({
      userId: req.auth.id,
    }).sort({ createdAt: -1 });

    if (extPackageBuyInfo && packageAmount <= extPackageBuyInfo.packageAmount) {
      return res.status(400).json({
        message: `You can only buy a package larger than Rs ${extPackageBuyInfo.packageAmount}`,
      });
    }

    // Check user balance
    const { depositBalance = 0, activeIncome = 0 } = await Wallet.findOne({
      userId: req.auth.id,
    });

    if (depositBalance + activeIncome < packageAmount) {
      return res.status(409).json({ message: "Insufficient balance!" });
    }

    // Fetch the user's ROI and information
    const extPackageRoi = await PackageRoi.findOne({ userId: req.auth.id });
    const currentUser = await User.findOne({ userId: req.auth.id });

    await topupWalletUpdate(
      depositBalance,
      activeIncome,
      packageAmount,
      currentUser.userId
    );
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
      packageType: "Buy",
    });
    if (createPackage) {
      return res.status(201).json({ message: "Package Create Successfully" });
    }
  } catch (error) {
    console.error("Error in createTopupController:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Get topup history
const getTopupHistoryController = async (req, res) => {
  try {
    const page = parseInt(req?.query?.page) || 1;
    const pageSize = parseInt(req?.query?.limit) || 10;
    // const searchById = req.query.searchById || "";
    // const searchByDate = req.query.searchByDate || "";

    const queryFilter = {
      userId: req.auth.id,
    };

    const options = {
      page: page,
      limit: pageSize,
      sort: { createdAt: -1 }, // Sorting by _id in descending order
    };

    const history = await PackageBuyInfo.paginate(queryFilter, options);
    if (history?.docs?.length > 0) {
      return res.status(200).json({ data: history });
    } else {
      return res.status(400).json({ message: "There is no topup history" });
    }
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};
module.exports = {
  createTopupController,
  getTopupHistoryController,
};
