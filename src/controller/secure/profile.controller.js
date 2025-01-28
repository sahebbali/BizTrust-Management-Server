const { cloudinary } = require("../../config/cloudinary");
const User = require("../../models/auth.model");
const ImageData = require("../../models/image.model");
const Otp = require("../../models/otp.model");
const Pin = require("../../models/pin.model");
const Wallet = require("../../models/wallet.model");
const bcrypt = require("bcryptjs");
const WalletAddress = require("../../models/walletAddress.model");
const { getIstTimeWithInternet } = require("../../config/internetTime");
const getIstTime = require("../../config/getTime");
const sendOtpMail = require("../../config/sendOtpMail");
const EmailAddress = require("../../models/emailAddress.model");
const Level = require("../../models/level.model");
const Kyc = require("../../models/KYCSchema");

const getAddressHistoryByUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const queryFilter = { userId: req.auth.id };

    const options = {
      page: page,
      limit: limit,
      sort: { createdAt: -1 },
    };

    const addresses = await WalletAddress.paginate(queryFilter, options);
    return res.status(200).json({ data: addresses });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// Get user Information
const getUserInfo = async (req, res) => {
  try {
    let userId = req.auth.id;
    const user = await User.findOne({ userId: userId }).select(["-password"]);
    if (user) {
      return res.status(200).json({
        data: user,
      });
    } else {
      return res.status(404).json({
        message: "Invalid user ID",
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: error.toString(),
    });
  }
};

// Update user Information
const updateUserInfo = async (req, res) => {
  try {
    const data = req.body;
    const updatedUser = await User.updateOne({ userId: data.userId }, data);
    if (updatedUser) {
      return res.status(200).json({
        message: "User information updated",
      });
    } else {
      return res.status(400).json({
        message: "Cannot update user information",
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};

// change password
const changePassword = async (req, res) => {
  try {
    const { current_password, new_password, otpCode } = req.body;
    const user_id = req.auth.id;
    if (!new_password) {
      return res.status(400).json({
        message: "New password is missing",
      });
    }
    if (!current_password) {
      return res.status(400).json({
        message: "Current password is missing",
      });
    }
    if (!otpCode) {
      return res.status(400).json({
        message: "OTP is missing",
      });
    }
    // find user
    const user = await User.findOne({ userId: user_id });
    if (user && (await user.matchPassword(current_password))) {
      // check OTP
      const otp = await Otp.findOne({ email: user.email });
      if (otp && parseInt(otp?.code) === parseInt(otpCode)) {
        const salt = bcrypt.genSaltSync(10);
        const encryptedPassword = bcrypt.hashSync(new_password, salt);
        await User.findOneAndUpdate(
          { userId: user_id },
          {
            $set: {
              password: encryptedPassword,
            },
          },
          { new: true }
        );
        return res.status(200).json({
          message: "Password change successfully",
        });
      } else {
        return res.status(400).json({
          message: "Invalid OTP",
        });
      }
    } else {
      return res.status(400).json({
        message: "Invalid Current Password",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: error.toString(),
    });
  }
};

// update email
const updateEmail = async (req, res) => {
  try {
    if (!req.body.currentEmail) {
      return res.status(400).json({
        message: "Field is required!",
      });
    } else {
      const { currentEmail, new_email, otpCode } = req.body;
      const user = await User.findOne({ userId: req.auth.id });
      // check already have anaccount with this email or not
      const existingUser = await User.findOne({ email: new_email });
      // check OTP
      const otp = await Otp.findOne({ email: new_email });
      if (otp?.code === otpCode) {
        if (!existingUser && user && user.email === currentEmail) {
          await User.findOneAndUpdate(
            { userId: req.auth.id },
            {
              $set: {
                email: new_email,
              },
            }
          );

          await Level.findOneAndUpdate(
            { userId: req.auth.id },
            {
              $set: {
                email: new_email,
              },
            }
          );

          await Level.findOneAndUpdate(
            { level: { $elemMatch: { userId: req.auth.id } } },
            {
              $set: {
                "level.$[t].email": new_email,
              },
            },
            {
              arrayFilters: [{ "t.email": new_email }],
            }
          );

          const ISTTime = await getIstTimeWithInternet();

          await EmailAddress.create({
            userId: user.userId,
            fullName: user.fullName,
            previousAddress: currentEmail,
            currentAddress: new_email,
            updatedBy: user.userId,
            date: new Date(
              ISTTime?.date ? ISTTime?.date : getIstTime().date
            ).toDateString(),
            time: ISTTime?.time ? ISTTime?.time : getIstTime().time,
          });

          return res.status(200).json({
            message: "Email changed Successfully",
          });
        } else {
          return res.status(400).json({
            message: "Invalid user ID or email",
          });
        }
      } else {
        return res.status(400).json({
          message: "Invalid OTP",
        });
      }
    }
  } catch (e) {
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};

const createOtpForEmailAddress = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const isExisting = await User.findOne({ email: email });

    if (isExisting) {
      return res.status(400).json({ message: "Email is already exist" });
    }

    const existingOtp = Otp.findOne({ email: email });

    if (existingOtp) {
      await Otp.deleteOne({ email: email });
    }

    const otpCode = Math.floor(1000 + Math.random() * 9000); // Generate OTP code
    const expireTime = new Date().getTime() + 300 * 1000; // create expire time

    const newOtp = await Otp.create({
      email: email,
      code: otpCode,
      expireIn: expireTime,
    });

    if (newOtp) {
      sendOtpMail(email, newOtp.code);
      return res.status(200).json({
        message: "OTP sent on your email",
      });
    } else {
      return res.status(400).json({
        message: "Can not send OTP",
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong!",
    });
  }
};

const matchCurrentEmailOtp = async (req, res) => {
  try {
    const { otpCode } = req.body;

    if (!otpCode) {
      return res.status(400).json({ message: "OTP is required" });
    }

    const user = await User.findOne({ userId: req.auth.id });
    const otp = await Otp.findOne({ email: user.email });

    if (otp?.code !== otpCode) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await Otp.deleteOne({ email: user.email });

    return res.status(200).json({ message: "OTP matched successfully!" });
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong!",
    });
  }
};

const createOtpForTrxAddressChangeByUserController = async (req, res) => {
  try {
    const userId = req.auth.id;

    const otpCode = Math.floor(1000 + Math.random() * 9000); // Generate OTP code
    const expireTime = new Date().getTime() + 300 * 1000; // create expire time

    const user = await User.findOne({ userId: userId });

    const existingOtp = Otp.findOne({ email: user.email });

    if (existingOtp) {
      await Otp.deleteOne({ email: user.email });
    }

    const newOtp = await Otp.create({
      email: user.email,
      code: otpCode,
      expireIn: expireTime,
    });

    if (newOtp) {
      sendOtpMail(user.email, newOtp.code);
      return res.status(200).json({
        message: "OTP sent on your email",
      });
    } else {
      return res.status(400).json({
        message: "Can not send OTP",
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong!",
    });
  }
};

// update TRX wallet address
const updateTrxAddress = async (req, res) => {
  try {
    const { trx_address, my_chain, otpCode } = req.body;

    if (!my_chain) {
      return res.status(400).json({ message: "Chain is required" });
    }
    if (!trx_address) {
      return res.status(400).json({ message: "USDT Address is required" });
    }
    if (!otpCode) {
      return res.status(400).json({ message: "OTP is required" });
    }
    if (!trx_address.startsWith("0x")) {
      return res
        .status(400)
        .json({ message: "Kindly add your USDT address (BEP20 Chain)" });
    }

    const ISTTime = await getIstTimeWithInternet();

    const user = await User.findOne({ userId: req.auth.id });
    const otp = await Otp.findOne({ email: user.email });

    if (otp?.code !== otpCode) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await User.findOneAndUpdate(
      { userId: user.userId },
      {
        $set: {
          walletAddress: trx_address,
          myChain: my_chain,
        },
      }
    );

    await WalletAddress.create({
      userId: user.userId,
      fullName: user.fullName,
      previousAddress: user.walletAddress ? user.walletAddress : "N/A",
      currentAddress: trx_address,
      updatedBy: user.userId,
      date: new Date(
        ISTTime?.date ? ISTTime?.date : getIstTime().date
      ).toDateString(),
      time: ISTTime?.time ? ISTTime?.time : getIstTime().time,
    });

    await Otp.deleteOne({ email: user.email });

    return res.status(200).json({ message: "USDT address is Updated" });

    // if (trx_address) {
    //   const exits = await User.findOne({ walletAddress: trx_address });
    //   if (exits) {
    //     await User.findOneAndUpdate(
    //       { userId: req.auth.id },
    //       {
    //         $set: {
    //           walletAddress: trx_address,
    //           myChain: my_chain,
    //         },
    //       }
    //     );
    //     return res.status(200).json({ message: "USDT address is Updated" });
    //   } else {
    //     await User.findOneAndUpdate(
    //       { userId: req.auth.id },
    //       {
    //         $set: {
    //           walletAddress: trx_address,
    //           myChain: my_chain,
    //         },
    //       }
    //     );
    //     return res
    //       .status(201)
    //       .json({ message: "USDT address updated Successfully" });
    //   }
    // }

    // else if (my_chain) {
    //   console.log('object2')
    //   const exits = await User.findOne({ myChain: my_chain });
    //   if (exits) {
    //     const user = await User.findOneAndUpdate(
    //       { userId: req.auth.id },
    //       {
    //         $set: {
    //           myChain: my_chain,
    //         },
    //       }
    //     );
    //     return res.status(200).json({ message: "My Chain is Updated" });
    //   } else {
    //     const user = await User.findOneAndUpdate(
    //       { userId: req.auth.id },
    //       {
    //         $set: {
    //           myChain: my_chain,
    //         },
    //       }
    //     );
    //     return res
    //       .status(201)
    //       .json({ message: "My Chain Created Successfully" });
    //   }
    // } else {
    //   return res
    //     .status(500)
    //     .json({ message: "My Chain and Wallet Address  is Missing" });
    // }

    // const extUser = await User.findOne({ userId: req.auth.id });
    // // find User
    // const user = await User.findOneAndUpdate(
    //   { userId: req.auth.id },
    //   {
    //     $set: {
    //       walletAddress: trx_address,
    //       myChain: my_chain,
    //     },
    //   }
    // );
    // // find wallet
    // const wallet = await Wallet.findOneAndUpdate(
    //   { userId: req.auth.id },
    //   {
    //     $set: {
    //       walletAddress: trx_address,
    //     },
    //   }
    // );
    // if (wallet && user) {
    //   return res
    //     .status(200)
    //     .json({ message: "USDT address changed successfully" });
    // } else {
    //   return res.status(400).json({ message: "Cannot change USDT address" });
    // }
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// upload user profile picture
const upLoadProofPic = async (req, res) => {
  try {
    // const user_id = req.auth.id;
    const image = await cloudinary.uploader.upload(req.file.path);
    const avatar = {
      avatar: image.secure_url,
      avatar_public_url: image.public_id,
    };
    return res.status(200).json({ avatar });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

// update user profile picture
const updateProfilePic = async (req, res) => {
  try {
    const user_id = req.auth.id;
    if (!req.file?.path)
      res.status(400).json({
        message: "Image is missing",
      });
    const findUser = await User.findOne({ userId: user_id });
    if (findUser.avatar_public_url) {
      await cloudinary.uploader.destroy(findUser.avatar_public_url);
    }
    const image = await cloudinary.uploader.upload(req.file.path);
    const avatar = {
      avatar: image.secure_url,
      avatar_public_url: image.public_id,
    };
    await User.findOneAndUpdate(
      { user_id: user_id },
      {
        $set: {
          avatar: avatar.avatar,
          avatar_public_url: avatar.avatar_public_url,
        },
      }
    );

    return res.status(200).json({ message: "Image uploaded" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};
const addPin = async (req, res) => {
  try {
    const { new_pin, confirm_new_pin, otpCode } = req.body;
    const user_id = req.auth.id;

    // Validate request data
    if (!new_pin) {
      return res.status(400).json({ message: "New Pin is missing" });
    }

    if (!confirm_new_pin) {
      return res.status(400).json({ message: "Confirm Pin is missing" });
    }

    if (new_pin !== confirm_new_pin) {
      return res.status(400).json({ message: "Pins do not match" });
    }

    if (!otpCode) {
      return res.status(400).json({ message: "OTP is missing" });
    }

    // Find the user
    const user = await User.findOne({ userId: user_id });

    // Check OTP
    const otp = await Otp.findOne({ email: user.email });

    if (otp && parseInt(otp?.code) === parseInt(otpCode)) {
      // Update or create the Pin record
      const pinData = {
        userId: user_id,
        fullName: user.fullName,
        new_pin: new_pin,
        confirm_pin: confirm_new_pin,
        status: true,
      };

      const userPin = await Pin.findOneAndUpdate(
        { userId: user_id },
        { $set: pinData },
        { upsert: true }
      );

      return res.status(200).json({ message: "Pin created successfully" });
    } else {
      return res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const getPin = async (req, res) => {
  try {
    const user_id = req.auth.id;
    const getpin = await Pin.find({ userId: user_id });
    if (getpin) {
      return res.status(200).json({ message: "Data Found", getpin });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const addUserWalletInfo = async (req, res) => {
  try {
    const { bankName, accountTitle, accountNumber, branchName } = req.body;
    const user_id = req.auth.id;
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
    const user = await User.findOne({ userId: user_id });

    // Update or create the Pin record
    const walletData = {
      userId: user_id,
      fullName: user.fullName,
      bankName,
      accountTitle,
      accountNoIBAN: accountNumber,
      branchCode: branchName,
    };

    const userPin = await WalletAddress.findOneAndUpdate(
      { userId: user_id },
      { $set: walletData },
      { upsert: true }
    );

    return res.status(200).json({ message: "Add Wallet successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const createKyc = async (req, res) => {
  const { date } = getIstTime();

  const sendResponse = (res, success, message, data) => {
    return res.json({
      success,
      message,
      data,
    });
  };

  try {
    // Get the request body
    const kycData = req.body;

    console.log(req.auth.id);
    // Check if the user already has a KYC in "success" or "pending" status
    const existingKyc = await Kyc.findOne({
      userId: req.auth.id,
      status: { $in: ["succeed", "pending"] },
    });

    if (!existingKyc) {
      // Set the user ID and create the KYC document
      kycData.userId = req.auth.id;
      kycData.submissionDate = new Date(date).toDateString();
      console.log({ kycData });
      const createdKyc = await Kyc.create(kycData);

      if (createdKyc) {
        // Return a success response
        return sendResponse(res, true, "KYC created successfully", createdKyc);
      } else {
        // Handle the case where KYC creation failed
        return sendResponse(res, false, "KYC creation failed", null);
      }
    } else {
      // Handle the case where the user already has a KYC
      return sendResponse(
        res,
        false,
        "User already has a KYC in progress or completed",
        null
      );
    }
  } catch (error) {
    // Handle unexpected errors
    console.error(error);
    return sendResponse(res, false, "Something went wrong", null);
  }
};

const getKyc = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const queryFilter = { userId: req.auth.id };

    const options = {
      page: page,
      limit: limit,
      sort: { createdAt: -1 }, // Sorting by _id in descending order
    };

    const histories = await Kyc.paginate(queryFilter, options);

    if (histories?.docs?.length > 0) {
      return res.status(200).json({ data: histories });
    } else {
      return res.status(400).json({
        message: "There is KYC history",
      });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const getKycSuccess = async (req, res) => {
  try {
    const userKyc = await Kyc.find({ userId: req.auth.id, status: "success" });

    if (userKyc && userKyc.length > 0) {
      res.status(200).json({ message: "KYC Document Found", data: userKyc });
    } else {
      res.status(500).json({ message: "SNo KYC documents found for the user" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong while fetching KYC documents" });
  }
};
module.exports = {
  createOtpForEmailAddress,
  matchCurrentEmailOtp,
  getAddressHistoryByUser,
  createOtpForTrxAddressChangeByUserController,
  getUserInfo,
  updateUserInfo,
  changePassword,
  updateEmail,
  updateTrxAddress,
  updateProfilePic,
  upLoadProofPic,
  addPin,
  getPin,
  addUserWalletInfo,
  createKyc,
  getKyc,
  getKycSuccess,
};
