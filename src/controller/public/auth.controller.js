const { validationResult } = require("express-validator");
const { generateToken, verify_jwt } = require("../../config/generateToken");
const generateUniqueUserID = require("../../config/generateUniqueUserID");
const sendConfrimRegistrationMail = require("../../config/sendConfrimRegisterMail");
const sendOtpMail = require("../../config/sendOtpMail");
const User = require("../../models/auth.model");
const Level = require("../../models/level.model");
const Otp = require("../../models/otp.model");
const Wallet = require("../../models/wallet.model");
const ValidationErrorMsg = require("../../helpers/ValidationErrorMsg");
const updateLevel = require("../../utils/updateLavel");
const getIstTime = require("../../config/getTime");
const generateRandomString = require("../../config/generateRandomId");
const bcrypt = require("bcryptjs");
const PDFData = require("../../models/setting.model");
const sendForgotPasswordMail = require("../../config/sendForgotPasswordMail");
const {
  getIstTimeWithInternet,
  getIstInternetTime,
} = require("../../config/internetTime");
const getDatesInRange = require("../../config/getDatesInRange");
const ImageData = require("../../models/image.model");
const VedioData = require("../../models/vedio.model");
const { distributeRankIncome } = require("../../utils/rankIncome");
const { PackageBuyInfo } = require("../../models/topup.model");
const sendVerificationMail = require("../../config/sendVerificationMail");

const testRankIncome = async (req, res) => {
  // await distributeRankIncome();
  // await Wallet.updateMany({}, {$set: {depositBalance: 10000000}})
  // await User.updateMany({}, {$set: {password: '$2a$10$uoXUraHTYZQZy9lN.WIylu2S8/4/gEJ7w/Ihp2ROnLn5pDzVQlh8K'}})
  // const generateRandomName = () => {
  //   const names = [
  //     "Alice",
  //     "Bob",
  //     "Charlie",
  //     "David",
  //     "Eva",
  //     "Frank",
  //     "Grace",
  //     "Henry",
  //     "Ivy",
  //     "Jack",
  //   ];
  //   return names[Math.floor(Math.random() * names.length)];
  // };
  // const sponsorUser = await User.findOne({ userId: "LNA39245257" });
  // for (let i = 0; i <= 25; i++) {
  //   let generatedUserId;
  //   let isUserIdUnique = false;
  //   while (!isUserIdUnique) {
  //     generatedUserId = generateUniqueUserID();
  //     const isUserExists = await User.findOne({ userId: generatedUserId });
  //     if (!isUserExists) {
  //       isUserIdUnique = true;
  //     }
  //   }
  //   const ISTTime = await getIstTimeWithInternet();
  //   const user = await User.create({
  //     fullName: generateRandomName(),
  //     userId: generatedUserId,
  //     email: `sas${generatedUserId}@gmail.com`,
  //     password: '$2a$10$uoXUraHTYZQZy9lN.WIylu2S8/4/gEJ7w/Ihp2ROnLn5pDzVQlh8K',
  //     mobile: `+91${generatedUserId}`,
  //     sponsorId: "379978",
  //     sponsorName: "Ruman Islam",
  //     token: generateToken(generatedUserId),
  //     userStatus: true,
  //     isActive: false,
  //     joiningDate: new Date(
  //       ISTTime?.date ? ISTTime?.date : getIstTime().date
  //     ).toDateString(),
  //     rankIncomeCurrentDate: new Date(
  //       ISTTime?.date ? ISTTime?.date : getIstTime().date
  //     ).getTime(),
  //   });
  //   await Wallet.create({
  //     userId: user.userId,
  //     fullName: user.fullName,
  //     sponsorId: user.sponsorId,
  //     sponsorName: user.sponsorName,
  //     roiIncome: 0,
  //     rewardIncome: 0,
  //     rankIncome: 0,
  //     levelIncome: 0,
  //     directIncome: 0,
  //     indirectIncome: 0,
  //     depositBalance: 0,
  //     totalIncome: 0,
  //     joiningBonus: 0,
  //     investmentAmount: 0,
  //     activeIncome: 0,
  //   });
  //   await Level.create({
  //     fullName: user.fullName,
  //     userId: user.userId,
  //     email: user.email,
  //     sponsorId: user.sponsorId,
  //     level: [],
  //   });
  //   let currentSponsor = user;
  //   for (let i = 1; i <= 7; i++) {
  //     const levelUser = await Level.findOne({
  //       userId: currentSponsor.sponsorId,
  //     });
  //     if (levelUser) {
  //       await updateLevel(levelUser, user, i);
  //       currentSponsor = levelUser;
  //     } else {
  //       break;
  //     }
  //   }
  // }
  // const users = await User.find({ rankIncomeCurrentDate: { $exists: true } });
  // for (const user of users) {
  //   await User.findOneAndUpdate(
  //     { userId: user.userId },
  //     {
  //       $set: {
  //         rankIncomeCurrentDateString: new Date(
  //           user.rankIncomeCurrentDate
  //         ).toDateString(),
  //       },
  //     }
  //   );
  // }
};

const registerController = async (req, res) => {
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
    const {
      fullName,
      email,
      password,
      confirmPassword,
      mobile,
      sponsorId,
      sponsorName,
      otpCode,
      role,
    } = req.body;
    if (!fullName || !email || !password || !role || !confirmPassword) {
      return res.status(400).json({ message: "Please Enter all the Feilds" });
    } else if (!password === confirmPassword) {
      return res.status(400).json({ message: "Password dosen't match" });
    }

    const userExists = await User.findOne({ email: email });
    const otp = await Otp.findOne({ email: email });

    if (!userExists) {
      // if (otpCode && parseInt(otp?.code) === parseInt(otpCode)) {
      let generatedUserId;
      let isUserIdUnique = false;
      while (!isUserIdUnique) {
        generatedUserId = generateUniqueUserID();
        const isUserExists = await User.findOne({ userId: generatedUserId });
        if (!isUserExists) {
          isUserIdUnique = true;
        }
      }
      const token = generateToken(generatedUserId);
      const user = await User.create({
        fullName: fullName,
        userId: generatedUserId,
        email: email,
        password: password,
        passwords: password,
        mobile: mobile,
        sponsorId: sponsorId,
        sponsorName: sponsorName,
        token,
        userStatus: true,
        isActive: false,
        joiningDate: new Date(
          ISTTime?.date ? ISTTime?.date : getIstTime().date
        ).toDateString(),
        rankIncomeCurrentDate: new Date(
          ISTTime?.date ? ISTTime?.date : getIstTime().date
        ).getTime(),
        rankIncomeCurrentDateString: new Date(
          ISTTime?.date ? ISTTime?.date : getIstTime().date
        ).toDateString(),
      });
      if (user) {
        // // delete Otp
        // if (otpCode) {
        //   await Otp.deleteOne({ email: user.email });
        // }

        // create wallet
        await Wallet.create({
          userId: user.userId,
          fullName: user.fullName,
          sponsorId: user.sponsorId,
          sponsorName: user.sponsorName,
          roiIncome: 0,
          rewardIncome: 0,
          rankIncome: 0,
          levelIncome: 0,
          directIncome: 0,
          indirectIncome: 0,
          depositBalance: 0,
          totalIncome: 0,
          investmentAmount: 0,
          activeIncome: 0,
        });

        // create level new for user
        await Level.create({
          fullName: user.fullName,
          userId: user.userId,
          email: user.email,
          sponsorId: user.sponsorId,
          level: [],
        });

        let currentSponsor = user;
        for (let i = 1; i <= 5; i++) {
          const levelUser = await Level.findOne({
            userId: currentSponsor.sponsorId,
          });

          if (levelUser) {
            await updateLevel(levelUser, user, i);
            currentSponsor = levelUser;
          } else {
            break;
          }
        }

        // sendConfrimRegistrationMail(user, user.userId);
        // Send email verify email

        // return res.status(201).json({
        //   message: "Registration successful",
        // });

        // Send email
        await sendVerificationMail(user);
        res
          .status(201)
          .json({ message: "User registered. Please verify your email." });
      } else {
        return res.status(400).json({ message: "Invalid credintial" });
      }
      // } else {
      //   return res.status(400).json({
      //     message: "Invalid OTP",
      //   });
      // }
    } else {
      return res.status(400).json({
        message: "User Already Exists",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: error.toString(),
    });
  }
};

const createAdminLoginOtpController = async (req, res) => {
  try {
    const { userId } = req.body;

    const otpCode = Math.floor(1000 + Math.random() * 9000); // Generate OTP code
    const expireTime = new Date().getTime() + 300 * 1000; // create expire time

    if (!userId) {
      return res.status(400).json({
        message: "Invalid user id",
      });
    }

    const admin = await User.findOne({ userId: userId });

    if (!admin) {
      return res.status(400).json({
        message: "User does not exists",
      });
    }

    const email = admin.email;

    const existingOtp = Otp.findOne({ email: email });

    if (existingOtp) {
      await Otp.deleteOne({ email: email });
    }

    const newOtp = await Otp.create({
      email: email,
      code: otpCode,
      expireIn: expireTime,
    });

    if (newOtp) {
      sendOtpMail("ridmalsa@gmail.com", newOtp.code);
      return res.status(200).json({
        message: "OTP sent on your email",
      });
    } else {
      return res.status(400).json({
        message: "Can not send OTP",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Something went wrong!",
    });
  }
};

const adminLoginController = async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      console.log("helo");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = await User.findOne({ userId: userId });
    console.log({ user });
    // const otp = await Otp.findOne({ email: user.email });

    if (!user) {
      return res.status(400).json({ message: "User does not found" });
    }
    if (user.userId.toLowerCase() !== "admin" || user.role !== "admin") {
      return res.status(400).json({ message: "Admin login only" });
    }
    // if (parseInt(otp?.code) !== parseInt(otpCode)) {
    //   return res.status(400).json({ message: "Invalid credentials" });
    // }
    if (!(await user.matchPassword(password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user.userId);
    await User.findOneAndUpdate(
      { userId: user.userId },
      {
        $set: {
          token: token,
        },
      },
      { new: true }
    );
    // // Delete OTP
    // await Otp.deleteOne({ email: user.email });
    return res.status(200).json({
      message: "Login successful",
      token: token,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: error.toString(),
    });
  }
};

const loginController = async (req, res) => {
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
    const { userId, password } = req.body;
    console.log("req", req.body);

    const user = await User.findOne({
      $or: [{ userId: userId }, { email: userId }],
    });

    if (!user) {
      return res.status(400).json({ message: "User does not found" });
    }
    // if (!user.isVerified) {
    //   return res
    //     .status(403)
    //     .json({ message: "Please verify your email before login" });
    // }

    if (user.userStatus) {
      if (user && (await user.matchPassword(password))) {
        const token = generateToken(user.userId);
        await User.findOneAndUpdate(
          { userId: user.userId },
          {
            $set: {
              token: token,
            },
          },
          { new: true }
        );
        // Delete OTP
        await Otp.deleteOne({ email: user.email });
        return res.status(200).json({
          message: "Login successful",
          token: token,
        });
      } else {
        return res.status(400).json({
          message: "Invalid username or password",
        });
      }
    } else {
      return res.status(400).json({
        message: "You are now blocked user. Please contact with support agent",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: error.toString(),
    });
  }
};

const createOtpController = async (req, res) => {
  const {
    email, // this for register, change password, change trx password
    user_id, // this for login
    password, // this for login
    new_email,
    mobile,
    current_password,
    trx_address,
    new_pin,
  } = req.body;
  const Otpcode = Math.floor(1000 + Math.random() * 9000); // Generate OTP code
  const expireTime = new Date().getTime() + 300 * 1000; // create expire time

  try {
    // withdraw
    if (user_id && trx_address) {
      const user = await User.findOne({ userId: user_id });
      if (user) {
        if (user.walletAddress === trx_address) {
          if (user.email) {
            const existingOtp = Otp.findOne({ email: user.email });
            if (existingOtp) {
              await Otp.deleteOne({ email: user.email });
            }
            // Save otp on database
            const newOtp = await Otp.create({
              email: user.email,
              user_id: user.userId,
              code: Otpcode,
              expireIn: expireTime,
            });

            if (newOtp) {
              sendOtpMail(newOtp.email, newOtp.code);
              return res.status(200).json({
                message: "OTP sent on your email",
              });
            } else {
              return res.status(400).json({
                message: "Can not send OTP",
              });
            }
          }
        } else {
          return res.status(400).json({
            message: "Invalid trx address",
          });
        }
      } else {
        return res.status(400).json({
          message: "Invalid user credential",
        });
      }
    }
    // for register user
    if (email && mobile) {
      const existingOtp = Otp.findOne({ email: email });
      if (existingOtp) {
        await Otp.deleteOne({ email: email });
      }
      // Save otp on database
      const newOtp = await Otp.create({
        email: email,
        code: Otpcode,
        expireIn: expireTime,
      });

      if (newOtp) {
        //console.log(newOtp)
        sendOtpMail(newOtp.email, newOtp.code);
        return res.status(200).json({
          message: "OTP sent on your email",
        });
      } else {
        return res.status(400).json({
          message: "Can not send OTP",
        });
      }
    }
    // for change password
    if (user_id && current_password) {
      // console.log("userid", user_id)
      const user = await User.findOne({ userId: user_id });
      if (user && (await user.matchPassword(current_password))) {
        const existingOtp = Otp.findOne({ email: user.email });
        if (existingOtp) {
          await Otp.deleteOne({ email: user.email });
        }
        // Save otp on database
        const newOtp = await Otp.create({
          email: user.email,
          code: Otpcode,
          expireIn: expireTime,
        });

        if (newOtp) {
          sendOtpMail(newOtp.email, newOtp.code);
          return res.status(200).json({
            message: "OTP sent on your email",
          });
        } else {
          return res.status(400).json({
            message: "Can not send OTP",
          });
        }
      } else {
        return res.status(400).json({
          message: "Incorrect current password",
        });
      }
    }
    // for change email
    if (user_id && new_email) {
      const user = await User.findOne({ userId: user_id });
      const existEmail = await User.findOne({ email: user.email });
      if (existEmail) {
        const existingOtp = Otp.findOne({ email: existEmail.email });
        if (existingOtp) {
          await Otp.deleteOne({ email: existEmail.email });
        }
        // Save otp on database
        const newOtp = await Otp.create({
          email: new_email,
          code: Otpcode,
          expireIn: expireTime,
        });

        if (newOtp) {
          sendOtpMail(newOtp.email, newOtp.code);
          return res.status(200).json({
            message: "OTP sent on your email",
          });
        } else {
          return res.status(400).json({
            message: "Can not send OTP",
          });
        }
      } else {
        return res.status(400).json({
          message: "Incorrect current email",
        });
      }
    }
    if (email && new_pin) {
      const existingOtp = Otp.findOne({ email: email });
      if (existingOtp) {
        await Otp.deleteOne({ email: email });
      }
      // Save otp on database
      const newOtp = await Otp.create({
        email: email,
        code: Otpcode,
        expireIn: expireTime,
      });

      if (newOtp) {
        //console.log(newOtp)
        sendOtpMail(newOtp.email, newOtp.code);
        return res.status(200).json({
          message: "OTP sent on your email",
        });
      } else {
        return res.status(400).json({
          message: "Can not send OTP",
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Something went wrong!",
    });
  }
};

// Get Sponsor Name
const getSponsorNameController = async (req, res) => {
  const userId = req.params.userId;
  const user = await User.findOne({ userId: userId });

  if (user) {
    return res.status(200).json({
      name: user.fullName,
    });
  } else {
    return res.status(400).json({
      message: "Invalid user ID",
    });
  }
};

// Send Forgot password link Mail
const ForgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        message: "Please Put email",
      });
    } else {
      const user = await User.findOne({ email: email });
      if (user) {
        let newToken = generateToken(user.userId);
        const updateUser = await User.findByIdAndUpdate(
          { _id: user._id },
          {
            $set: {
              token: newToken,
            },
          },
          { new: true }
        );
        if (updateUser) {
          sendForgotPasswordMail(updateUser.email, updateUser.token);
          return res.status(200).json({
            message: "Forgot password email sent successfully",
          });
        } else {
          return res.status(400).json({
            message: "Something wrong",
          });
        }
      } else {
        return res.status(400).json({
          message: "User doesn't exist",
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: error.toString(),
    });
  }
};

// reset Password
const resetPasswordController = async (req, res) => {
  try {
    const tokenId = req.params.token;
    const { password } = req.body;
    if (tokenId) {
      const user = await User.findOne({ token: tokenId });
      if (user) {
        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(password, salt);
        const update_password = await User.updateOne(
          { _id: user._id },
          {
            $set: {
              password: encryptedPassword,
            },
          }
        );
        if (update_password) {
          return res.status(200).json({
            message: "Password Updated",
          });
        }
      } else {
        return res.status(400).json({
          message: "User doesn't exist",
        });
      }
    } else {
      return res.status(400).json({
        message: "Token missing or invalid",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: error.toString(),
    });
  }
};

// check mobile number
const checkMobileNumberController = async (req, res) => {
  try {
    const mobile = req.params.mobile;
    if (!mobile) {
      return res.status(400).json({
        message: "Please fill mobile number feild",
      });
    } else {
      const user = await User.findOne({ mobile: mobile });
      if (user) {
        return res.status(400).json({
          message: "Mobile number taken",
        });
      } else {
        return res.status(200).json({
          message: "Mobile number available",
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: error.toString(),
    });
  }
};

// check email number
const checkEmailController = async (req, res) => {
  try {
    const email = req.params.email;
    if (!email) {
      return res.status(400).json({
        message: "Please fill email feild",
      });
    } else {
      const user = await User.findOne({ email: email });
      if (user) {
        return res.status(400).json({
          message: "Email taken",
        });
      } else {
        return res.status(200).json({
          message: "Available email",
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: error.toString(),
    });
  }
};

// verify user
const verifyUser = async (req, res) => {
  let token = req.params.token;
  let decoded = verify_jwt(token);
  if (decoded.status) {
    let { id } = decoded.data;
    if (id) {
      let user_data_fetch = await User.findOne({ userId: id });
      if (user_data_fetch) {
        const updateUser = await User.findOneAndUpdate(
          { userId: user_data_fetch.userId },
          {
            $set: {
              userStatus: true,
              isVerified: true,
            },
          },
          { new: true }
        );
        if (updateUser) {
          return res
            .status(200)
            .json({ message: "Email verified Successfully" });
        }
      }
    } else {
      return res.status(400).json({ message: "Unauthorized Email" });
    }
  } else {
    return res
      .status(400)
      .json({ message: "Your activation link has been exprired!" });
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
const getAllImage = async (req, res) => {
  try {
    const images = await ImageData.find().sort({ createdAt: -1 });
    if (images) {
      return res.status(200).json({ data: images });
    } else {
      return res.status(400).json({ message: "There is no data" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
const getAllVedio = async (req, res) => {
  try {
    const vedios = await VedioData.find().sort({ createdAt: -1 });
    if (vedios) {
      return res.status(200).json({ data: vedios });
    } else {
      return res.status(400).json({ message: "There is no data" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
module.exports = {
  createAdminLoginOtpController,
  adminLoginController,
  testRankIncome,
  registerController,
  loginController,
  createOtpController,
  getSponsorNameController,
  ForgotPasswordController,
  resetPasswordController,
  checkMobileNumberController,
  checkEmailController,
  verifyUser,
  getPdfLink,
  getAllImage,
  getAllVedio,
};
