const nodemailer = require("nodemailer");

const sendEmailNotification = (
  user_id,
  name,
  email,
  subject,
  amount,
  message,
  type // deposit / withdraw
) => {
  // Hostinger SMTP Transport
  let transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: "info@grow-boo.com",
      pass: "6t=CYL~&9wO",
    },
  });

  // HTML TEMPLATE (Black & Yellow Theme)
  let messageBody = `
  <div style="max-width:600px;margin:auto;background:#000;color:#fff;padding:30px;border-radius:10px;font-family:Arial, sans-serif;">
      
      <div style="text-align:center;">
          <h2 style="color:#facc15;">Grow-Boo International</h2>
          <p style="color:#ccc;">Account Notification</p>
      </div>

      <div style="margin-top:20px;">
          <p>Hello <strong style="color:#facc15;">${name}</strong>,</p>
          <p>Your request has been reviewed.</p>

          <div style="background:#111;padding:15px;border-left:5px solid #facc15;margin-top:20px;border-radius:6px;">
              <p style="margin:0;"><strong>User ID:</strong> ${user_id}</p>
              <p style="margin:0;"><strong>Request Type:</strong> ${type}</p>
              <p style="margin:0;"><strong>Amount:</strong> Rs ${amount}</p>
              <p style="margin-top:10px;color:#facc15;font-weight:bold;">${message}</p>
          </div>

          <p style="margin-top:25px;color:#ccc;">
              If you need any help, feel free to contact our support team.
          </p>

          <p style="color:#facc15;font-weight:bold;">
              Grow-Boo International Support Team
          </p>
      </div>

      <div style="text-align:center;margin-top:25px;">
          <p style="font-size:12px;color:#555;">© Grow-Boo International. All Rights Reserved.</p>
      </div>

  </div>
  `;

  let mailOption = {
    from: "Grow-Boo International <info@grow-boo.com>",
    to: email,
    subject: subject,
    html: messageBody,
  };

  transporter.sendMail(mailOption, async (error, info) => {
    if (error) {
      console.log("Email Error:", error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = sendEmailNotification;
