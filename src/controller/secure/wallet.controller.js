const User = require("../../models/auth.model");
const cloudinary = require("../../config/cloudinary");
const Deposit = require("../../models/deposit.model");
const Wallet = require("../../models/wallet.model");
const generateRandomString = require("../../config/generateRandomId");
const { getIstTimeWithInternet } = require("../../config/internetTime");
const getIstTime = require("../../config/getTime");
const WalletAddress = require("../../models/walletAddress.model");
const { PackageBuyInfo } = require("../../models/topup.model");

// deposite
const depositeAmount = async (req, res) => {
  const ISTTime = await getIstTimeWithInternet();
  try {
    const { user_id, amount, hash } = req.body;
    if (!req.body)
      return res.status(400).json({
        message: "Please provide data",
      });
    if (!req.file?.path)
      return res.status(400).json({
        message: "Proof image is missing",
      });
    if (!user_id)
      return res.status(400).json({
        message: "User Id is missing",
      });
    if (!amount)
      return res.status(400).json({
        message: "Amount is missing",
      });
    const existHash = await Deposit.findOne({
      hash,
      $or: [{ status: "success" }, { status: "pending" }],
    });
    // console.log({ existHash });
    if (existHash) {
      return res.status(400).json({ message: "Hash already used" });
    }
    // find user
    const user = await User.findOne({ userId: user_id });

    const image = await cloudinary.uploader.upload(req.file?.path);
    const avatar = {
      avatar: image.secure_url,
      avatarPublicUrl: image.public_id,
    };
    if (user) {
      if (parseInt(amount) >= 25) {
        await Deposit.create({
          userId: user.userId,
          name: user.fullName,
          amount: parseInt(amount),
          status: "pending",
          date: new Date(
            ISTTime?.date ? ISTTime?.date : getIstTime().date
          ).toDateString(),
          time: ISTTime?.time ? ISTTime?.time : getIstTime().time,
          transactionId: generateRandomString(),
          hash: hash,
          proofPic: avatar,
          remark: "",
        });
        return res.status(200).json({
          message: "Deposit request successful",
        });
      } else {
        return res.status(400).json({
          message: "Minimum deposit amount is 30",
        });
      }
    } else {
      return res.status(400).json({
        message: "Invalid User ID",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};

// get deposite history
const depositeHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const queryFilter = { userId: req.auth.id };

    const options = {
      page: page,
      limit: limit,
      sort: { createdAt: -1 },
    };

    const deposits = await Deposit.paginate(queryFilter, options);
    return res.status(200).json({ data: deposits });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
// Get My wallet
const getMyWallet = async (req, res) => {
  try {
    const queryFilter = {
      userId: req.auth.id,
      isActive: true,
    };

    // Use aggregation to calculate the sum of packageAmount
    const result = await PackageBuyInfo.aggregate([
      { $match: queryFilter }, // Filter documents based on the query
      {
        $group: {
          _id: null, // Group all documents together
          totalPackageAmount: { $sum: "$packageAmount" }, // Sum the packageAmount field
        },
      },
    ]);
    const wallet = await Wallet.findOne({ userId: req.auth.id });
    if (wallet) {
      return res.status(200).json({
        data: wallet,
        totalPackageAmount: result[0].totalPackageAmount,
      });
    }
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};

const checkHash = async (req, res) => {
  try {
    const { hash } = req.query;
    console.log({ hash });

    if (!hash) {
      return;
    }
    // Check if a deposit with the given hash and status exists
    const existHash = await Deposit.findOne({
      hash,
      $or: [{ status: "success" }, { status: "pending" }],
    });
    // console.log({ existHash });
    if (existHash) {
      return res.status(400).json({ message: "Hash already used" });
    } else {
      return res.status(200).json({ message: "Valid hash" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

const getSystemWallet = async (req, res) => {
  try {
    const existWallet = await WalletAddress.find({ isAdmin: true }).sort({
      createdAt: -1,
    });
    if (existWallet) {
      return res.status(200).json({ data: existWallet });
    } else {
      return res.status(400).json({ message: "Data Not Found" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};
module.exports = {
  depositeAmount,
  depositeHistory,
  getMyWallet,
  checkHash,
  getSystemWallet,
};
