const nodemailer = require("nodemailer");

const SendManageDepositMail = (
  userId,
  fullName,
  previousDepositBalance,
  amount,
  minusAmount,
  plusAmount,
  today,
  time
) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: "info@grow-boo.com", // your official email
      pass: "6t=CYL~&9wO",
    },
  });

  const mailOption = {
    from: `"Grow-Boo" <info@grow-boo.com>`,
    to: "info@grow-boo.com",
    subject: "Manage Deposit Update",
    html: `
  <div style="width:100%; background:#000; padding:25px; color:#fff; font-family:Arial;">
    <div style="
      max-width:600px; 
      margin:auto; 
      background:#111; 
      padding:25px; 
      border-radius:10px; 
      border:1px solid #edf100;
    ">

      <h2 style="text-align:center; color:#edf100; margin-bottom:20px;">
        Deposit Update Notification
      </h2>

      <p style="font-size:16px; line-height:1.5;">
        Hello <strong>Grow-Boo Admin</strong>,  
        <br><br>
        A deposit update has been performed. Below are the details:
      </p>

      <div style="margin-top:20px; padding:15px; background:#000; border:1px solid #222; border-radius:8px;">
        <p><strong style="color:#edf100;">Full Name:</strong> ${fullName}</p>
        <p><strong style="color:#edf100;">User ID:</strong> ${userId}</p>
        <p><strong style="color:#edf100;">Previous Amount:</strong> ${previousDepositBalance}</p>
        <p><strong style="color:#edf100;">Current Amount:</strong> ${amount}</p>
        <p><strong style="color:#edf100;">Plus Amount:</strong> ${plusAmount}</p>
        <p><strong style="color:#edf100;">Minus Amount:</strong> ${minusAmount}</p>
        <p><strong style="color:#edf100;">Date:</strong> ${today}</p>
        <p><strong style="color:#edf100;">Time:</strong> ${time}</p>
      </div>

      <p style="font-size:14px; margin-top:20px; color:#ccc;">
        This is an automated notification from Grow-Boo.
      </p>

    </div>
  </div>
    `,
  };

  transporter.sendMail(mailOption, (error, info) => {
    if (error) {
      console.log("Email send error:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

module.exports = SendManageDepositMail;
