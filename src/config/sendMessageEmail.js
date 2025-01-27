const nodemailer = require("nodemailer");

const sendMessageEmail = (name, user_id, email, message, subject, mobile) => {
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 587,
    secure: false,
    auth: {
      user: "sahebbali253@gmail.com",
      pass: "kocxithpcxvpdizh",
    },
  });

  let messageBody = `<div>
        <p>${message}</p>
        <br />
        <p>${name}</p>
        <p>${email}</p>
        <p>${user_id}</p>
        <p>${mobile}</p>
    </div>`;

  let mailOption = {
    from: email,
    to: "sahebbali253@gmail.com",
    subject: subject,
    html: messageBody,
  };

  transporter.sendMail(mailOption, async (error, info) => {});
};

module.exports = sendMessageEmail;
