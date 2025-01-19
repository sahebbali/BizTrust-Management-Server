const { validationResult } = require("express-validator");
const getIstTime = require("../../config/getTime");
const User = require("../../models/auth.model");
const Contact = require("../../models/contactus.model");
const ValidationErrorMsg = require("../../helpers/ValidationErrorMsg");
const { getIstTimeWithInternet } = require("../../config/internetTime");

// create contact us mesasge
const createContactUs = async (req, res) => {
  const ISTTime = await getIstTimeWithInternet();
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
    const { message, name, user_id, email } = req.body;
    const userId = req.auth.id;
    const subject = "About Safe And Secure Trade";

    if (!req.body)
      return res.status(400).json({
        message: "Please provide data",
      });
    if (!message)
      return res.status(400).json({
        message: "Message is missing",
      });
    if (!name)
      return res.status(400).json({
        message: "Name is missing",
      });
    if (!user_id)
      return res.status(400).json({
        message: "User ID is missing",
      });
    if (!email)
      return res.status(400).json({
        message: "Email is missing",
      });

    // find user
    const user = await User.findOne({ userId: user_id });
    console.log({ user });
    if (user && user_id === userId) {
      // already have Contact collection or not
      const existingContact = await Contact.findOne({ userId: user_id });
      if (!existingContact) {
        const newContact = await Contact.create({
          userId: user.userId,
          user_name: name,
          history: [
            {
              userId: user.userId,
              mobile: user.mobile,
              user_name: name,
              email,
              message,
              subject,
              date: new Date(
                ISTTime?.date ? ISTTime?.date : getIstTime().date
              ).toDateString(),
              time: ISTTime.time,
            },
          ],
        });
        if (newContact) {
          return res.status(200).json({
            message: "Contact us message created successfully",
          });
        } else {
          return res.status(400).json({
            message: "Cannot create contact us message",
          });
        }
      } else {
        // update existing support
        const updateContact = await Contact.findOneAndUpdate(
          { userId: user_id },
          {
            $push: {
              history: {
                userId: user.userId,
                mobile: user.mobile,
                user_name: name,
                email: email,
                message: message,
                subject: subject,
                date: new Date(
                  ISTTime?.date ? ISTTime?.date : getIstTime().date
                ).toDateString(),
                time: ISTTime?.time ? ISTTime?.time : getIstTime().time,
              },
            },
          }
        );
        if (updateContact) {
          return res.status(200).json({
            message: "Contact us message created successfully",
          });
        } else {
          return res.status(400).json({
            message: "Cannot create contact us message",
          });
        }
      }
    } else {
      return res.status(400).json({
        message: "Invalid user credentials",
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: error.toString(),
    });
  }
};

// get contact us history
const getContactUsHistory = async (req, res) => {
  try {
    // const userId = req.params.user_id;
    const userId = req.auth.id;
    if (userId) {
      const contactUs = await Contact.findOne({ userId: userId }).sort({
        "history.date": -1,
        "history.time": -1,
      });
      if (contactUs) {
        return res.status(200).json(contactUs);
      } else {
        return res.status(400).json({
          message: "Cannot find Contact us history",
        });
      }
    } else {
      return res.status(400).json({
        message: "Cannot find user credentials",
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: error.toString(),
    });
  }
};

module.exports = { createContactUs, getContactUsHistory };
