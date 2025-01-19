const { topUpPackageAmount } = require("../../constants/topup.constants");
const User = require("../../models/auth.model");
const { PackageBuyInfo, PackageRoi } = require("../../models/topup.model");
const Wallet = require("../../models/wallet.model");
const { ThisMonthTeamBusiness } = require("../../utils/thisMonthTeamBusniess");
const { processPackageAction } = require("../../utils/topupPackage");
const { getIstTimeWithInternet } = require("../../config/internetTime");
const getIstTime = require("../../config/getTime");

const createTopupController = async (req, res) => {
  try {
    const ISTTime = await getIstTimeWithInternet();
    const dateStringToCheck = new Date(
      ISTTime?.date ? ISTTime?.date : getIstTime().date
    ).toDateString();
    const isSatOrSun =
      dateStringToCheck.includes("Sat") || dateStringToCheck.includes("Sun");

    if (isSatOrSun) {
      return res
        .status(400)
        .json({ message: "Top up isn't available on Saturday and Sunday" });
    }

    let { packageAmount } = req.body;
    const type = req.query.type;
    // Find existing Package Buying Info
    const extPackageBuyInfo = await PackageBuyInfo.findOne({
      userId: req.auth.id,
    }).sort({ createdAt: -1 });
    let amount;

    if (extPackageBuyInfo) {
      console.log("ext package");
      amount = packageAmount - extPackageBuyInfo?.packageInfo?.amount;
    } else {
      console.log("not ext package");
      amount = packageAmount;
    }
    console.log("Amount", Math.abs(amount));
    await ThisMonthTeamBusiness(req.auth.id, Math.abs(amount));
    // Find existing Package ROI
    const extPackageRoi = await PackageRoi.findOne({ userId: req.auth.id });
    // Get current user
    const currentUser = await User.findOne({ userId: req.auth.id });
    if (!type) {
      return res.status(400).json({ message: "Invalid Request" });
    }
    if (!packageAmount) {
      return res.status(400).json({ message: "Package is required" });
    }
    // find package amount
    const dynamicTopUpPackageAmount = [];
    const maxAmount =
      packageAmount >= 10000 ? packageAmount - 1000 : packageAmount;
    const increment = 1000;
    if (maxAmount >= 10000) {
      // Generate dynamic values starting from $11,000
      let nextAmount = maxAmount + increment;
      while (nextAmount <= maxAmount + increment * 10) {
        dynamicTopUpPackageAmount.push(nextAmount);
        nextAmount += increment;
      }
    } else {
      dynamicTopUpPackageAmount.push(...topUpPackageAmount);
    }
    if (!dynamicTopUpPackageAmount.includes(packageAmount)) {
      return res.status(400).json({ message: "Invalid Package Amount 333" });
    }
    const startDate = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    startDate.setDate(startDate.getDate() + 1);
    // Extracting the balance of user
    const { depositBalance = 0, activeIncome = 0 } = await Wallet.findOne({
      userId: req.auth.id,
    });
    /**********
     * If user status true then amount will deduct (currentPackageAmount - prevPackageAmount),
     * Or user status false then amount will deduct only currentPackageAmount
     *
     * ******/
    let prevPackDeductPackAmount =
      currentUser?.isActive && extPackageRoi?.isActive
        ? packageAmount - extPackageRoi?.currentPackage
        : packageAmount;

    if (depositBalance + activeIncome < prevPackDeductPackAmount) {
      return res.status(409).json({ message: "Insufficient balance!" });
    }

    if (type === "activate") {
      if (currentUser?.isActive && extPackageRoi?.isActive) {
        return res.status(400).json({
          message: "You already activated a package. You need to upgrade.",
        });
      }
      if (
        currentUser?.isActive === false &&
        extPackageRoi?.isActive === false
      ) {
        if (extPackageRoi?.currentPackage > packageAmount) {
          return res.status(400).json({
            message:
              "You need to activate with the same or greater than the current package.",
          });
        }
        await processPackageAction(
          req.auth.id,
          packageAmount,
          prevPackDeductPackAmount,
          extPackageBuyInfo,
          depositBalance,
          activeIncome,
          startDate,
          "Nothing",
          "Again Buy"
        );
        return res
          .status(201)
          .json({ message: "Package Activated Successfully" });
      }
      await processPackageAction(
        req.auth.id,
        packageAmount,
        prevPackDeductPackAmount,
        extPackageBuyInfo,
        depositBalance,
        activeIncome,
        startDate,
        "Buy",
        "Nothing"
      );
      return res
        .status(201)
        .json({ message: "Package Activated Successfully" });
    } else if (type === "upgrade") {
      if (!extPackageBuyInfo) {
        return res
          .status(400)
          .json({ message: "You have to activate a package first" });
      }
      if (extPackageBuyInfo?.packageInfo?.amount >= packageAmount) {
        return res.status(400).json({
          message:
            "You can't upgrade with less than or the same current package",
        });
      }
      await processPackageAction(
        req.auth.id,
        packageAmount,
        prevPackDeductPackAmount,
        extPackageBuyInfo,
        depositBalance,
        activeIncome,
        startDate,
        "Upgrade",
        "Nothing"
      );
      return res.status(200).json({ message: "Package Upgraded Successfully" });
    }
  } catch (error) {
    console.log(error);
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
