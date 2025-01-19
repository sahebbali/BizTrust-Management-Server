const cloudinary = require("../../config/cloudinary");
const fs = require("fs");
const { Reward } = require("../../models/reward.model");
const Cloudinary = require("cloudinary");

const uploadRewardImage = async (req, res) => {
  const { id } = req.body;
  try {
    const reward = await Reward.find({});
    if (reward.length >= 6) {
      return res.status(400).json({ message: "Maximum image upload 6" });
    }
    for (const file of req.files) {
      const { path } = file;
      const result = await cloudinary.uploader.upload(path);
      const image = {
        url: result?.secure_url,
        publicId: result?.public_id,
      };
      const extReward = await Reward.findOne({ _id: id });
      if (!extReward) {
        await Reward.create({
          image: image,
        });
        return res.status(200).json({ message: "Reward Sent successfully" });
      } else {
        await Cloudinary.v2.api.delete_resources(extReward?.image?.publicId);
        await Reward.findByIdAndUpdate({ _id: id }, { $set: { image: image } });
        return res.status(200).json({ message: "Reward updated successfully" });
      }
    }
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: "Something went wrong" });
  }
};
const deleteRewardImage = async (req, res) => {
  const { id, publicId } = req.body;
  try {
    // Delete the image from Cloudinary
    const oldPic = await Cloudinary.v2.api.delete_resources(publicId);

    // Delete the Reward document
    const deleteImage = await Reward.findByIdAndDelete({ _id: id });

    if (oldPic && deleteImage) {
      res.status(200).json({
        message: "Successfully deleted Reward Image",
      });
    }
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const getAllRewards = async (req, res) => {
  try {
    const rewards = await Reward.find({}); // Retrieve all documents from the Reward collection
    return res.status(200).json(rewards); // Send the rewards as a JSON response
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  uploadRewardImage,
  deleteRewardImage,
  getAllRewards,
};
