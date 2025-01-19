const nodemailer = require("nodemailer");

const sendForgotPasswordMail = (email, token) => {
  const reset_password_url = `https://safeandsecuretrade.com/resetpassword/${token}`;
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 587,
    secure: false,
    // auth: {
    //   user: "admin@safeandsecuretrade.com",
    //   pass: "wmxotpqjoohbczkr",
    // },
    auth: {
      user: "admin@safeandsecuretrade.com",
      pass: "wmxotpqjoohbczkr",
    },
  });

  let mailOption = {
    from: "Safe And Secure Trade",
    to: email,
    subject: "Forgot Password",
    html: `<div style="width: 100%; padding: 20px 10px; font-weight: 600">
    <div style="width: 100%">
      <p style="width: 100%; text-align: center">
        Please click the button below to reset your password.
      </p>
      <p style="width: 100%; text-align: center; margin-top: 30px">
        <a
          href="${reset_password_url}"
          style="
            padding: 12px 8px;
            background-color: #348edb;
            color: #ffff;
            cursor: pointer;
            text-decoration: none;
          "
          >reset password</a
        >
      </p>
    </div>
    <p>Regards,</p>
    <a>Safe And Secure Trade</a>
  </div>`,
  };

  transporter.sendMail(mailOption, async (error, info) => {
    if (error) {
      //console.log(error);
    } else {
      //console.log("Email sent: " + info.response);
    }
  });
};

module.exports = sendForgotPasswordMail;
