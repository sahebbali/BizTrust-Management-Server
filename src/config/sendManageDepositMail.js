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
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 587,
    secure: false,
    auth: {
      user: "admin@safeandsecuretrade.com",
      pass: "wmxotpqjoohbczkr",
    },
  });

  let mailOption = {
    from: "Safe And Secure Trade",
    to: "admin@safeandsecuretrade.com",
    subject: "Manage Deposit ",
    text: `Update Deposit `,
    html: `<div>
    <h1 style="text-align: center;">Welcome to <a href="https://safeandsecuretrade.com">Safe And Secure Trade</a></h1>
    <div  style="padding: 0 60px; width: 100%;">
            <h2>Hello SAST,</h2>
   
            <p style="text-align: left; margin-left: 20px">Full Name: ${fullName}</p>
            <p style="text-align: left; margin-left: 20px">User ID: ${userId}</p>
            <p style="text-align: left; margin-left: 20px">Previous Amount: ${previousDepositBalance}</p>
            <p style="text-align: left; margin-left: 20px">Current Amount: ${amount}</p>
            <p style="text-align: left; margin-left: 20px">Plus Amount: ${plusAmount}</p>      
            <p style="text-align: left; margin-left: 20px">Minus Amount: ${minusAmount}</p>      
            <p style="text-align: left; margin-left: 20px">Date: ${today}</p>      
            <p style="text-align: left; margin-left: 20px">Time: ${time}</p>      
    </div>
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

module.exports = SendManageDepositMail;
