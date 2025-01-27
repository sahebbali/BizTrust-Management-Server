const nodemailer = require("nodemailer");

const sendOtpMail = (email, otp) => {
  let transpoter = nodemailer.createTransport({
    service: "Gmail",
    port: 587,
    secure: false,
    auth: {
      user: "sahebbali253@gmail.com",
      pass: "kocxithpcxvpdizh",
    },
  });
  console.log(otp);
  let mailOption = {
    from: "BizTrust Management",
    to: email,
    subject: "OTP Code",
    html: `<div>
        <p>Here is your OTP code: ${otp}</p>
        <br />
        <p>Regards,</p>
        <p>BizTrust Management</p>
    </div>`,
  };

  transpoter.sendMail(mailOption, async (error, info) => {
    if (error) {
    } else {
    }
  });
};

module.exports = sendOtpMail;
