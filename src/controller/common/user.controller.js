const PopupImage = require("../../models/popupImagemodel");
const User = require("../../models/auth.model");
const PDFData = require("../../models/setting.model");

// Get user Information
const getUserInfo = async (req, res) => {
    try {
      // const userId = req.params.user_id;
      let userId = req.auth.id;
  
    const user = await User.findOne({ userId: userId }).select(["-password"])
    // const {password, ...userInfo} = user._doc;
  
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
        message: error.toString()
      })
    }
  };

  // get popup image
  const getPopUpImg = async (req, res) =>{
  try {
    const findImage = await PopupImage.findOne({image_id: "POPUPIMAGE"});
    if(findImage){
      return res.status(200).json({
        avatar: findImage.avatar,
        avatar_public_url: findImage.avatar_public_url,
      });
      
    }else{
      return res.status(400).json({ message: "Cannot find Image" });
    }
    // await upImage.save();
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: error.message.toString() });
  }
}

// Get pdf link
const getPdfLink = async (_req, res) =>{
  try {
      const result = await PDFData.findOne({pdfId: "PDFID"})
      if(result){
        return res.status(200).json({data: result})
      }else{
        return res.status(400).json({message: "There is no data"})
      }
  } catch (error) {
      return res.status(500).json({message: "Something went wrong"})
  }
}

  module.exports = {
    getUserInfo,
    getPopUpImg,
    getPdfLink
  };