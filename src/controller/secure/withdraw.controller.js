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

// Withdraw
const withdrawAmount = async (req, res) => {
  // Withdraw Validation
  const error = validationResult(req).formatWith(ValidationErrorMsg);
  if (!error.isEmpty()) {
    let msg;
    Object.keys(req.body).map((d) => {
      if (error.mapped()[d] !== undefined) {
        msg = error.mapped()[d];
      }
    });
    if (msg !== undefined) {
      return res.status(400).json({
        message: msg,
      });
    }
  }
  try {
    const { amount, trx_address, withdrawType, myChain, pin } = req.body;
    const userId = req.auth.id;
    const user = await User.findOne({ userId });
    const MyChain = await User.findOne({ myChain });
    const wallet = await Wallet.findOne({ userId });
    const PIN = await Pin.findOne({ userId });
    const ISTTime = await getIstTimeWithInternet();
    const today = new Date(ISTTime?.date ? ISTTime?.date : getIstTime().date).toDateString().split(" ")[0];
    if (!PIN) {
      return res.status(400).json({
        message: "Please Set Your PIN",
      });
    }
    if (!MyChain) {
      return res.status(400).json({
        message: "Please Set Your My Chain",
      });
    }
    if (PIN?.new_pin !== pin) {
      return res.status(400).json({
        message: "Invild PIN",
      });
    }
    if (
      forbiddenDates.includes(
        new Date(ISTTime?.date ? ISTTime?.date : getIstTime().date).toDateString().split(" ").slice(1, 3).join(" ")
      )
    ) {
      // console.log("Withdraw isn't available on Dec 24 to Jan 03");
      return res.status(400).json({
        message: "Withdraw isn't available on Dec 24 to Jan 03",
      });
    }
    if (today === "Sat" || today === "Sun") {
      return res.status(400).json({
        message: "Withdraw isn't available on Saturday and Sunday",
      });
    }

    if (user?.isActive) {
      if (
        (withdrawType === "investment" &&
          Number(amount) === wallet.investmentAmount) ||
          (withdrawType === "profit" && Number(amount) >= 10 && Number(amount) <= wallet.activeIncome)
      ) {
        const updateFields = {};
        const newData = {};

        if (withdrawType === "investment") {
          updateFields.investmentAmount = -Number(amount);
          await User.findOneAndUpdate(
            { userId },
            { $set: { isActive: false, "packageInfo.amount": 0 } }
          ),
            await PackageRoi.findOneAndUpdate(
              { userId },
              { $set: { isActive: false } }
            ),
            (newData.message = "Investment withdraw successfully");
        } else if (withdrawType === "profit") {
          updateFields.activeIncome = -Number(amount);
          newData.currentAmount = wallet.activeIncome - Number(amount);
          newData.message = "Profit withdraw successfully";
        }

        await Promise.all([
          Wallet.findOneAndUpdate({ userId }, { $inc: updateFields }),
        ]);

        newData.userId = userId;
        newData.fullName = user.fullName;
        newData.sponsorId = user.sponsorId;
        newData.sponsorName = user.sponsorName;
        newData.requestAmount = Number(amount);
        newData.withdrawCharge = 6;
        newData.amountAfterCharge = Number(amount) - (Number(amount) / 100) * 6;
        newData.currentAmount =
          withdrawType === "profit" ? wallet.activeIncome - Number(amount) : 0;
        newData.trxAddress = trx_address;
        newData.status = "pending";
        newData.transactionId = generateRandomString();
        newData.transactionHash = "";
        newData.withdrawType = withdrawType;
        newData.date = new Date(getIstTime().date).toDateString();
        newData.time = getIstTime().time;
        newData.myChain = myChain;

        const createdData = await Withdraw.create(newData);
        if (createdData) {
          return res.status(201).json({ message: newData.message });
        }
      } else {
        return res.status(400).json({
          message:
            withdrawType === "investment"
              ? "You must withdraw the full investment amount"
              : "Minimum withdraw amount is $10",
        });
      }
    } else {
      return res.status(400).json({ message: "You are an inactive user" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
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
