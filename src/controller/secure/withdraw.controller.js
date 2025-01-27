const { validationResult } = require("express-validator");
const generateRandomString = require("../../config/generateRandomId");
const getIstTime = require("../../config/getTime");
const User = require("../../models/auth.model");
const { PackageRoi } = require("../../models/topup.model");
const Wallet = require("../../models/wallet.model");
const Withdraw = require("../../models/withdraw.model");
const ValidationErrorMsg = require("../../helpers/ValidationErrorMsg");
const Pin = require("../../models/pin.model");
const { getIstTimeWithInternet } = require("../../config/internetTime");
const { forbiddenDates } = require("../../constants/topup.constants");
const Otp = require("../../models/otp.model");
const WalletAddress = require("../../models/walletAddress.model");

// Withdraw
const withdrawAmount = async (req, res) => {
  try {
    // Validate the request body
    const error = validationResult(req).formatWith(ValidationErrorMsg);
    if (!error.isEmpty()) {
      const msg = Object.values(error.mapped())[0]?.msg;
      return res.status(400).json({ message: msg || "Validation error" });
    }

    const { accountNoIBAN, amount, otpCode, withdrawType } = req.body;
    const userId = req.auth.id;

    // Fetch user and wallet details
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const wallet = await Wallet.findOne({ userId });
    const userWallet = await WalletAddress.findOne({ userId });
    // console.log({ userWallet });
    const otp = await Otp.findOne({ email: user.email });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    // Get current date and check if it is the last day of the month
    const ISTTime = await getIstTimeWithInternet();
    const currentDate = new Date(ISTTime?.date || getIstTime().date);
    console.log({ currentDate });
    const isLastDayOfMonth =
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      ).getDate() === currentDate.getDate();
    console.log({ isLastDayOfMonth });
    // Check OTP
    if (!otp || parseInt(otp?.code) !== parseInt(otpCode)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Ensure user is active
    if (!user.isActive) {
      return res.status(400).json({ message: "You are an inactive user" });
    }

    // Validate minimum withdrawal amount
    if (amount < 10) {
      return res
        .status(400)
        .json({ message: "Minimum withdrawal amount is Rs10" });
    }

    // Check wallet balance based on withdrawal type
    let sufficientBalance = false;
    // console.log("e wallet", wallet.eWallet);
    // console.log("profit wallet", wallet.profitWallet);
    // console.log("Active ", wallet.activeIncome);
    // console.log("amount", amount);
    if (withdrawType === "E-wallet") {
      sufficientBalance = amount <= wallet.eWallet;
    } else if (withdrawType === "Profit Wallet") {
      if (!isLastDayOfMonth) {
        return res.status(400).json({
          message:
            "Profit Wallet withdrawals are allowed only on the last day of the month",
        });
      }
      sufficientBalance = amount <= wallet.profitWallet;
    } else if (withdrawType === "Both") {
      if (!isLastDayOfMonth) {
        return res.status(400).json({
          message:
            "'Both' withdrawals are allowed only on the last day of the month",
        });
      }
      sufficientBalance = amount <= wallet.profitWallet + wallet.eWallet;
    }

    if (!sufficientBalance) {
      return res.status(400).json({ message: "Insufficient Balance" });
    }

    // Deduct amount from wallet and create withdrawal record
    const updateFields = {};
    if (withdrawType === "E-wallet") {
      updateFields.eWallet = -amount;
    } else if (withdrawType === "Profit Wallet") {
      updateFields.profitWallet = -amount;
    } else if (withdrawType === "Both") {
      const remainingAmount = amount - wallet.eWallet;
      updateFields.eWallet = -Math.min(amount, wallet.eWallet);
      updateFields.profitWallet = -Math.max(0, remainingAmount);
    }

    await Wallet.findOneAndUpdate({ userId }, { $inc: updateFields });

    const withdrawCharge = 5;
    const newData = {
      userId,
      fullName: user.fullName,
      sponsorId: user.sponsorId,
      sponsorName: user.sponsorName,
      requestAmount: amount,
      withdrawCharge,
      amountAfterCharge: amount - (amount * withdrawCharge) / 100,
      currentAmount: wallet.activeIncome - amount,
      bankName: userWallet?.bankName,
      accountTitle: userWallet?.accountTitle,
      accountNoIBAN: userWallet?.accountNoIBAN,
      branchCode: userWallet?.branchCode,
      status: "pending",
      transactionId: generateRandomString(),
      transactionHash: "",
      withdrawType,
      date: currentDate.toDateString(),
      time: getIstTime().time,
    };

    const createdData = await Withdraw.create(newData);
    if (createdData) {
      return res
        .status(201)
        .json({ message: "Withdrawal request created successfully" });
    }

    return res
      .status(500)
      .json({ message: "Failed to create withdrawal request" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// get withdraw history
const withdrawHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const queryFilter = { userId: req.auth.id };

    const options = {
      page: page,
      limit: limit,
      sort: { createdAt: -1 }, // Sorting by _id in descending order
    };

    const withdrawInfo = await Withdraw.paginate(queryFilter, options);

    if (withdrawInfo?.docs?.length > 0) {
      return res.status(200).json({ data: withdrawInfo });
    } else {
      return res.status(400).json({
        message: "There is no withdraw history",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

module.exports = { withdrawAmount, withdrawHistory };
