const nodemailer = require("nodemailer");

const sendEmailNotification = (
  user_id,
  name,
  email,
  subject,
  amount,
  message,
  type
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

  let messageBody = `<div>
        <strong>Hello Dear,</strong> <br/>
        <p>User ID: ${user_id} and Name: ${name}</p>
        <p>We have an important update regarding your ${type} request for <strong>$${amount}</strong> amount:</p>
        <p>${message}</p>
        <p>
          For further details or assistance, please contact our customer support team at safeandsecuretradepro@gmail.com. <br/>
          Thank you for choosing Safe and Secure Trade.
        </p>
        Best regards, <br/>
        Safe and Secure Trade
    </div>`;

  let mailOption = {
    from: "Safe And Secure Trade",
    to: email,
    subject: subject,
    html: messageBody,
  };

  transporter.sendMail(mailOption, async (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = sendEmailNotification;
