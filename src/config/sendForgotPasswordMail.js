const nodemailer = require("nodemailer");

const sendForgotPasswordMail = (email, token) => {
  const reset_password_url = `https://grow-boo.com/resetpassword/${token}`;

  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: "info@grow-boo.com",
      pass: "6t=CYL~&9wO",
    },
  });

  const mailOption = {
    from: '"Grow-Boo International" <info@grow-boo.com>',
    to: email,
    subject: "Reset Your Grow-Boo Password",
    html: `
  <div style="
    width: 100%;
    background-color: #000;
    padding: 30px;
    font-family: Arial, sans-serif;
    color: #fff;
  ">

    <div style="
      max-width: 600px;
      margin: auto;
      background-color: #111;
      padding: 30px;
      border-radius: 10px;
      border: 1px solid #edf100;
    ">

      <h2 style="
        text-align:center;
        color:#edf100;
        margin-bottom: 20px;
      ">
        Password Reset Request 🔐
      </h2>

      <p style="font-size: 16px; line-height: 1.6;">
        We received a request to reset the password for your 
        <strong>Grow-Boo International</strong> account.
      </p>

      <p style="font-size: 15px; margin-top: 10px;">
        If you made this request, click the button below to reset your password:
      </p>

      <!-- BUTTON -->
      <div style="text-align:center; margin: 35px 0;">
        <a 
          href="${reset_password_url}"
          style="
            padding: 14px 28px;
            background-color: #edf100;
            color: #000;
            font-weight: bold;
            text-decoration: none;
            border-radius: 6px;
            font-size: 16px;
            display: inline-block;
          "
        >
          Reset Password
        </a>
      </div>

      <p style="font-size: 15px; line-height: 1.6;">
        If you did not request a password reset, you can safely ignore this email.
        Your account will remain secure.
      </p>

      <br />

      <p style="font-size: 15px; line-height: 1.6;">
        For security reasons, this link will expire soon.  
        If it does, simply request a new one.
      </p>

      <br />

      <p>Best Regards,</p>
      <p style="color:#edf100; font-weight:bold;">Grow-Boo Team</p>

      <a href="https://grow-boo.com" target="_blank" style="color:#fff;">
        www.grow-boo.com
      </a>

    </div>

  </div>
    `,
  };

  transporter.sendMail(mailOption, async (error, info) => {
    if (error) {
      console.log("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

module.exports = sendForgotPasswordMail;
