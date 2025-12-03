const nodemailer = require("nodemailer");

const sendWithdrawalMail = (user, amount, method, date, status) => {
  // STATUS CAN BE: "success" OR "rejected"

  const isSuccess = status === "success";

  const title = isSuccess ? "Withdrawal Successful ✔" : "Withdrawal Rejected ✖";

  const subject = isSuccess
    ? "Withdrawal Successful – Grow-Boo International"
    : "Withdrawal Rejected – Grow-Boo International";

  const message = isSuccess
    ? `Your withdrawal request of <strong style="color:#edf100;">${amount}</strong> has been successfully processed and sent to your designated account.`
    : `Unfortunately, your withdrawal request of <strong style="color:#edf100;">${amount}</strong> has been rejected. Please review your account details or contact support for assistance.`;

  const statusColor = isSuccess ? "#00ff00" : "#ff4444"; // green or red
  const statusText = isSuccess ? "Successful" : "Rejected";

  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: "info@grow-boo.com",
      pass: "6t=CYL~&9wO",
    },
  });

  const mailOptions = {
    from: '"Grow-Boo International" <info@grow-boo.com>',
    to: user.email,
    subject: subject,
    html: `
      <div style="width:100%; background:#000; padding:30px; font-family:Arial, sans-serif; color:#fff;">
        <div style="
            max-width:600px; 
            margin:auto; 
            background:#111; 
            border-radius:10px; 
            padding:30px; 
            border:1px solid #edf100;
        ">
          
          <h2 style="text-align:center; color:#edf100; margin-bottom:20px;">
            ${title}
          </h2>

          <p style="font-size:16px; margin-bottom:10px;">
            Dear <strong style="color:#edf100;">${user.fullName}</strong>,
          </p>

          <p style="font-size:15px; line-height:1.6;">
            ${message}
          </p>

          <div style="
            margin:25px 0; 
            padding:15px 20px; 
            background:#000; 
            border-left:4px solid ${statusColor};
            border-radius:8px;
          ">
            <p style="margin:5px 0; font-size:15px;"><strong>Amount:</strong> ${amount}</p>
            <p style="margin:5px 0; font-size:15px;"><strong>Method:</strong> ${method}</p>
            <p style="margin:5px 0; font-size:15px;"><strong>Date:</strong> ${date}</p>
            <p style="margin:5px 0; font-size:15px;">
              <strong>Status:</strong> 
              <span style="color:${statusColor}; font-weight:bold;">${statusText}</span>
            </p>
          </div>

          <p style="font-size:15px; line-height:1.5;">
            Thank you for trusting  
            <strong style="color:#edf100;">Grow-Boo International</strong>.
            If you need any assistance, our support team is always here to help.
          </p>

          <br/>

          <p>Regards,</p>
          <p style="color:#edf100; font-weight:bold;">
            Grow-Boo International Support Team
          </p>

          <a href="https://grow-boo.com" style="color:#fff; text-decoration:none;">
            www.grow-boo.com
          </a>
        </div>
      </div>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Withdrawal Mail Error:", error);
    } else {
      console.log("Withdrawal Email Sent:", info.response);
    }
  });
};

module.exports = sendWithdrawalMail;
