const nodemailer = require("nodemailer");

const sendOtpMail = (email, otp) => {
  let transpoter = nodemailer.createTransport({
    service: "Gmail",
    port: 587,
    secure: false,
    auth: {
      user: "admin@safeandsecuretrade.com",
      pass: "wmxotpqjoohbczkr",
    },
  });
  console.log(otp);
  let mailOption = {
    from: "Safe And Secure Trade",
    to: email,
    subject: "OTP Code",
    html: `<div>
        <p>Here is your OTP code: ${otp}</p>
        <br />
        <p>Regards,</p>
        <p>Safe And Secure Trade</p>
    </div>`,
  };

  transpoter.sendMail(mailOption, async (error, info) => {
    if (error) {
    } else {
    }
  });
};

module.exports = sendOtpMail;
