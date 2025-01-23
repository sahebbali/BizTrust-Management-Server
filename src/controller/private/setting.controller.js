const cloudinary = require("../../config/cloudinary");
const Cloudinary = require("cloudinary");
const User = require("../../models/auth.model");
const Otp = require("../../models/otp.model");
const bcrypt = require("bcryptjs");
const PDFData = require("../../models/setting.model");
const generateRandomString = require("../../config/generateRandomId");
const VedioData = require("../../models/vedio.model");
const Image = require("../../models/image.model");
const PopupImage = require("../../models/popupImagemodel");
const ManageROIHistory = require("../../models/manageROI");

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
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};
// Chagne email
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
          let updateEmail = await User.findOneAndUpdate(
            { userId: req.auth.id },
            {
              $set: {
                email: new_email,
              },
            },
            { new: true }
          );
          if (updateEmail) {
            return res.status(200).json({
              message: "Email changed Successfully",
            });
          }
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
//   Change PDF
const changePdfLink = async (req, res) => {
  try {
    if (!req.body.pdfLink)
      res.status(400).json({
        message: "PDF link is missing",
      });
    const findPdf = await PDFData.findOne({ pdfId: "PDFID" });
    if (findPdf) {
      const upLink = await PDFData.findOneAndUpdate(
        { pdfId: "PDFID" },
        {
          $set: {
            pdfLink: req.body.pdfLink,
          },
        }
      );
      if (upLink) {
        res.status(200).json({ message: "PDF link updated" });
      } else {
        res.status(200).json({ message: "Cannot update pdf link" });
      }
    } else {
      const createLink = await PDFData.create({
        pdfLink: req.body.pdfLink,
      });
      if (createLink) {
        res.status(200).json({ message: "PDF link uploaded" });
      } else {
        res.status(200).json({ message: "Cannot upload pdf link" });
      }
    }
  } catch (error) {
    //console.log(error)
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const createImage = async (req, res) => {
  try {
    if (!req.file?.path)
      res.status(400).json({
        message: "Image is missing",
      });

    const image = await Cloudinary.uploader.upload(req.file.path);
    // console.log("image", image);
    const avatar = {
      avatar: image.secure_url,
      avatarPublicUrl: image.public_id,
    };
    const upImage = await Image.create({
      avatar: avatar.avatar,
      avatarPublicUrl: avatar.avatarPublicUrl,
    });
    if (upImage) {
      return res.status(200).json({ message: "Image uploaded" });
    } else {
      return res.status(400).json({ message: "Cannot upload Image" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getImages = async (_req, res) => {
  try {
    // Retrieve all images from the database
    const images = await Image.find();

    if (images?.length > 0) {
      // Respond with the array of images
      return res.status(200).json(images);
    } else {
      return res.status(400).json({ message: "There are no images" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { avatarPublicUrl } = req.body;

    const findImage = await Image.findOne({
      avatarPublicUrl: avatarPublicUrl,
    });
    if (findImage?.avatarPublicUrl) {
      await Cloudinary.uploader.destroy(findImage.avatarPublicUrl);
    }

    // Find the image by imageId and remove it from the database
    const deletedImage = await Image.findOneAndRemove({
      avatarPublicUrl: avatarPublicUrl,
    });

    // Respond with the deleted image
    if (deletedImage) {
      return res.status(200).json({ message: "Image Delete Successfull" });
    } else {
      return res.status(404).json({ message: "Image not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const createVedio = async (req, res) => {
  try {
    const { vedioLink } = req.body;
    const vedioId = generateRandomString();
    // Create a new image document
    const newVedio = await VedioData.create({ vedioId, vedioLink });
    // Respond with the saved document
    return res
      .status(201)
      .json({ message: "Video Created Successfull", newVedio });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const getVedio = async (req, res) => {
  try {
    // Retrieve all images from the database
    const vedios = await VedioData.find();
    if (vedios) {
      return res.status(200).json(vedios);
    } else {
      return res.status(404).json({ message: "Video not found" });
    }
    // Respond with the array of images
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const deleteVedio = async (req, res) => {
  try {
    const { vedioId } = req.body;

    // Find the image by imageId and remove it from the database
    const deletedVedio = await VedioData.findOneAndRemove({ vedioId });
    // Respond with the deleted image
    if (deletedVedio) {
      return res.status(200).json({ message: "Video Delete Successfull" });
    } else {
      return res.status(404).json({ message: "Video not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const createPopUpImage = async (req, res) => {
  try {
    if (!req.file?.path)
      res.status(400).json({
        message: "Image is missing",
      });

    const image = await Cloudinary.uploader.upload(req.file.path);
    // console.log("image", image);
    const avatar = {
      avatar: image.secure_url,
      avatarPublicUrl: image.public_id,
    };
    const upImage = await PopupImage.create({
      avatar: avatar.avatar,
      avatar_public_url: avatar.avatarPublicUrl,
    });
    if (upImage) {
      return res.status(200).json({ message: "Image uploaded" });
    } else {
      return res.status(400).json({ message: "Cannot upload Image" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const createManageROI = async (req, res) => {
  try {
    const { date, percentage } = req.body;
    const today = new Date(date).toDateString();
    const existROIHistory = await ManageROIHistory.findOne({ date: today });
    if (existROIHistory) {
      return res.status(400).json({ message: "Already Exist Manage ROI Date" });
    }
    // Create a new image document
    const manageROI = await ManageROIHistory.create({
      date: today,
      percentage,
    });
    // Respond with the saved document
    return res.status(201).json({ message: "Successful", manageROI });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllManageROI = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchById = req.query.searchById || "";
    const searchByStartDate = new Date(req.query.startDate).getTime() || "";
    const searchByEndDate = new Date(req.query.endDate).getTime() || "";
    const downloadCSV = req.query.csv || "";

    const matchStage = {
      $match: {
        $and: [
          searchById ? { userId: searchById } : {},
          searchByStartDate && searchByEndDate
            ? {
                $or: [
                  {
                    "levelDate.miliSec": {
                      $gte: searchByStartDate,
                      $lte: searchByEndDate,
                    },
                  },
                  {
                    date: new Date(searchByStartDate).toDateString(),
                  },
                ],
              }
            : {},
        ],
      },
    };

    const histories = await ManageROIHistory.aggregate([
      {
        $addFields: {
          "levelDate.miliSec": { $toLong: { $toDate: "$date" } },
        },
      },
      matchStage,
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $project: {
          __v: 0,
        },
      },
    ]);

    const totalHistoryPipleine = [
      {
        $addFields: {
          "levelDate.miliSec": { $toLong: { $toDate: "$date" } },
        },
      },
      matchStage,
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ];

    const totalHistories = await ManageROIHistory.aggregate(
      totalHistoryPipleine
    );

    const totalItems = totalHistories.length > 0 ? totalHistories[0].count : 0;
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const nextPage = hasNextPage ? page + 1 : null;

    const response = {
      totalDocs: totalItems,
      limit: limit,
      totalPages: totalPages,
      totalAmount: totalHistories[0]?.totalAmount,
      page: page,
      pagingCounter: page,
      hasPrevPage: page > 1,
      hasNextPage: hasNextPage,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: nextPage,
      docs: histories,
    };
    // Download CSV
    if (downloadCSV === "csv") {
      const result = await ManageROIHistory.aggregate([
        {
          $addFields: {
            "levelDate.miliSec": { $toLong: { $toDate: "$date" } },
          },
        },
        matchStage,
        {
          $project: {
            __v: 0,
          },
        },
      ]);
      return res.status(200).json({ csv: result, data: response });
    }

    if (totalHistories.length > 0) {
      return res.status(200).json({
        message: "Retrieved the all Level Income History",
        data: response,
      });
    } else {
      return res.status(400).json({ message: "History Not Found" });
    }
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};

const deleteManageROI = async (req, res) => {
  try {
    const { objectId } = req.body;

    if (!objectId) {
      return res.status(400).json({ message: "objectId is required" });
    }

    // Find and remove the ROI by its ID
    const deletedManageROI = await ManageROIHistory.findByIdAndRemove(objectId);

    if (deletedManageROI) {
      return res.status(200).json({ message: "Delete Successful" });
    } else {
      return res.status(404).json({ message: "ROI not found" });
    }
  } catch (error) {
    console.error("Error deleting ROI:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const editManageROI = async (req, res) => {
  try {
    const { objectId, date, percentage } = req.body;

    // Validate required fields
    if (!objectId) {
      return res.status(400).json({ message: "objectId is required" });
    }
    if (!percentage) {
      return res.status(400).json({ message: "Percentage is required" });
    }

    // Find and update the ROI entry
    const updatedManageROI = await ManageROIHistory.findByIdAndUpdate(
      objectId,
      { $set: percentage },
      { new: true, runValidators: true } // Returns the updated document and enforces schema validation
    );

    // Check if the document exists and was updated
    if (updatedManageROI) {
      return res
        .status(200)
        .json({ message: "Update Successful", data: updatedManageROI });
    } else {
      return res.status(404).json({ message: "ROI not found" });
    }
  } catch (error) {
    console.error("Error updating ROI:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = {
  changePassword,
  updateEmail,
  changePdfLink,
  createImage,
  getImages,
  deleteImage,
  createVedio,
  getVedio,
  deleteVedio,
  createPopUpImage,

  createManageROI,
  getAllManageROI,
  deleteManageROI,
  editManageROI,
};
