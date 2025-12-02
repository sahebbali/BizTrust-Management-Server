const nodemailer = require("nodemailer");
const sendVerificationMail = async (user) => {
  // const link = `${process.env.BASE_URL}/login/${user?.token}`;
  const link = `https://grow-boo.com//login/${user?.token}`;
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 587,
    secure: false,
    auth: {
      user: "sahebbali253@gmail.com",
      pass: "kocxithpcxvpdizh",
    },
  });
  const mailOptions = {
    from: "Grow-boo",
    to: user?.email,
    subject: "Verify Your Email",
    html: `<div style="width: 100%; padding: 20px 10px; font-weight: 600">
      <div style="width: 100%">
        <p style="width: 100%; text-align: center">
          Thank you to joining on Grow-boo. Please use the link below to
          verify your email.
        </p>
        <p style="width: 100%; text-align: center; margin-top: 30px">
          <a
            href="${link}"
            style="
              padding: 12px 8px;
              background-color: #edf100ff;
              color: #ffff;
              cursor: pointer;
              text-decoration: none;
            "
            >Verify Email</a
          >
        </p>
      </div>
      <p>Regards,</p>
      <a target="_blank" href="https://grow-boo.com/">Growboo</a>
    </div>`,
  };

  transporter.sendMail(mailOptions, async (error, info) => {
    if (error) {
    } else {
    }
  });
};
module.exports = sendVerificationMail;
