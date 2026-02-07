const PopupImage = require("../../models/popupImagemodel");
const User = require("../../models/auth.model");
const PDFData = require("../../models/setting.model");
const sendConfirmRegistrationMail = require("../../config/sendConfrimRegisterMail");

// Get user Information
const getUserInfo = async (req, res) => {
  try {
    const userId = req?.auth?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const user = await User.findOne(
      { userId },
      {
        password: 0,
        token: 0,
        __v: 0,
        _id: 0,
        createdAt: 0,
        updatedAt: 0,
        passwords: 0,
        team: 0,
      },
    ).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("getUserInfo error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// get popup image
const getPopUpImg = async (req, res) => {
  try {
    console.log("hello Image");
    const findImage = await PopupImage.findOne({ image_id: "TLCPOPUPIMAGE" });
    if (findImage) {
      return res.status(200).json({
        avatar: findImage.avatar,
        avatar_public_url: findImage.avatar_public_url,
      });
    } else {
      return res.status(400).json({ message: "Cannot find Image" });
    }
    // await upImage.save();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message.toString() });
  }
};

// Get pdf link
const getPdfLink = async (_req, res) => {
  try {
    const result = await PDFData.findOne({ pdfId: "PDFID" });
    if (result) {
      return res.status(200).json({ data: result });
    } else {
      return res.status(400).json({ message: "There is no data" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const verifyEmail = async (req, res) => {
  // console.log("hello time verify email");
  const { token } = req.params;
  if (!token) {
    return res.status(400).json({ message: "Token Missing" });
  }
  const user = await User.findOne({
    token,
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  user.isVerified = true;
  user.userStatus = true;

  const updateUser = await user.save();
  if (updateUser) {
    // console.log("hello");
    sendConfirmRegistrationMail(user, user.userId);
    res.status(200).json({ message: "Email verified successfully!" });
  }
};

module.exports = {
  getUserInfo,
  getPopUpImg,
  getPdfLink,
  verifyEmail,
};
