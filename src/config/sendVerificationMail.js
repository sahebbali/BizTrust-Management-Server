const nodemailer = require("nodemailer");
const sendVerificationMail = async (user) => {
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 587,
    secure: false,
    auth: {
      user: "admin@safeandsecuretrade.com",
      pass: "wmxotpqjoohbczkr",
    },
  });
  const mailOptions = {
    from: "Safe And Secure Trade",
    to: user?.email,
    subject: "Verify Your Email",
    html: `<div style="width: 100%; padding: 20px 10px; font-weight: 600">
      <div style="width: 100%">
        <p style="width: 100%; text-align: center">
          Thank you to joining on SafeAndSecureTrade. Please use the link below to
          verify your email.
        </p>
        <p style="width: 100%; text-align: center; margin-top: 30px">
          <a
            href="https://safeandsecuretrade.com/login/${user?.token}"
            style="
              padding: 12px 8px;
              background-color: #348edb;
              color: #ffff;
              cursor: pointer;
              text-decoration: none;
            "
            >Verify Email</a
          >
        </p>
      </div>
      <p>Regards,</p>
      <a target="_blank" href="https://safeandsecuretrade.com">safeandsecuretrade</a>
    </div>`,
  };

  transporter.sendMail(mailOptions, async (error, info) => {
    if (error) {
    } else {
    }
  });
};
module.exports = sendVerificationMail;
