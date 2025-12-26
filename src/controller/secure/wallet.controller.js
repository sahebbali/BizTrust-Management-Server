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
    const { user_id, amount, hash, bankName, securityType } = req.body;

    if (!req.body) {
      return res.status(400).json({ message: "Please provide data" });
    }

    if (!req.file?.path) {
      return res.status(400).json({ message: "Proof image is missing" });
    }

    if (!user_id) {
      return res.status(400).json({ message: "User Id is missing" });
    }

    if (!amount) {
      return res.status(400).json({ message: "Amount is missing" });
    }

    if (!bankName) {
      return res.status(400).json({ message: "Bank Name is missing" });
    }

    if (!securityType) {
      return res.status(400).json({ message: "Security Type is missing" });
    }

    const numericAmount = parseFloat(amount);

    // ✅ Security-type-based validation
    if (securityType === "Equity Fund" && numericAmount < 15000) {
      return res.status(400).json({
        message: "Amount must be at least 15000 for Equity Fund",
      });
    }

    if (securityType === "Assets Fund" && numericAmount < 1000000) {
      return res.status(400).json({
        message: "Amount must be at least 1000000 for Assets Fund",
      });
    }

    const existHash = await Deposit.findOne({
      hash,
      $or: [{ status: "success" }, { status: "pending" }],
    });

    if (existHash) {
      return res.status(400).json({ message: "Hash already used" });
    }

    const user = await User.findOne({ userId: user_id });

    if (!user) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    const image = await cloudinary.uploader.upload(req.file.path);
    const avatar = {
      avatar: image.secure_url,
      avatarPublicUrl: image.public_id,
    };

    await Deposit.create({
      userId: user.userId,
      name: user.fullName,
      amount: numericAmount,
      bankName,
      securityType,
      status: "pending",
      date: new Date(
        ISTTime?.date ? ISTTime.date : getIstTime().date
      ).toDateString(),
      time: ISTTime?.time ? ISTTime.time : getIstTime().time,
      transactionId: generateRandomString(),
      hash,
      proofPic: avatar,
      remark: "",
    });

    return res.status(200).json({
      message: "Deposit request successful",
    });
  } catch (error) {
    console.error(error);
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
    const downloadCSV = req.query.csv || "";

    const queryFilter = { userId: req.auth.id };

    const options = {
      page: page,
      limit: limit,
      sort: { createdAt: -1 },
    };

    const deposits = await Deposit.paginate(queryFilter, options);
    if (downloadCSV) {
      const csvData = await Deposit.find(queryFilter).select(
        "-_id  -transactionID -hash -createdAt -updatedAt -__v -proofPic"
      );
      return res.status(200).json({ csv: csvData, data: deposits });
    }

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
        totalPackageAmount: result[0]?.totalPackageAmount || 0,
      });
    }
  } catch (error) {
    console.log({ error });
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
