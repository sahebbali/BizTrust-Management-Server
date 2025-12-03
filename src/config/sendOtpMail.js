const nodemailer = require("nodemailer");

const sendOtpMail = (email, otp) => {
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
    from: '"Grow-Boo" <info@grow-boo.com>',
    to: email,
    subject: "🔐 Your Grow-Boo OTP Code",
    html: `
      <div style="width: 100%; background:#000; padding: 30px; font-family: Arial, sans-serif; color: #fff;">
        <div style="
            max-width: 500px; 
            margin: auto; 
            background:#111; 
            padding: 30px; 
            border-radius:10px;
            border:1px solid #edf100;
        ">

          <h2 style="text-align:center; color:#edf100; margin-bottom:20px;">
            Your OTP Code
          </h2>

          <p style="font-size:15px; line-height:1.5;">
            To complete your verification, use the One-Time Password (OTP) below:
          </p>

          <div style="
            margin: 25px 0;
            text-align:center;
            background:#000;
            border-left:4px solid #edf100;
            padding: 15px 20px;
            border-radius:8px;
          ">
            <p style="
              font-size:28px; 
              font-weight:bold; 
              color:#edf100; 
              letter-spacing:4px;
              margin:0;
            ">
              ${otp}
            </p>
          </div>

          <p style="font-size:14px; color:#ccc;">
            This OTP is valid for a limited time.  
            Do not share it with anyone for security reasons.
          </p>

          <br/>

          <p>Regards,</p>
          <p style="color:#edf100; font-weight:bold;">Grow-Boo Team</p>

          <a href="https://grow-boo.com" style="color:#fff; text-decoration:none;">
            www.grow-boo.com
          </a>
        </div>
      </div>
    `,
  };

  transporter.sendMail(mailOption, async (error, info) => {
    if (error) {
      console.log("OTP Email Error:", error);
    } else {
      console.log("OTP Email Sent:", info.response);
    }
  });
};

module.exports = sendOtpMail;
