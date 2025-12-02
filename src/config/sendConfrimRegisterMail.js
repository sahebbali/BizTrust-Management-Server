const nodemailer = require("nodemailer");

const sendConfirmRegistrationMail = (user, userId) => {
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 587,
    secure: false,
    auth: {
      user: "sahebbali253@gmail.com",
      pass: "kocxithpcxvpdizh",
    },
  });

  let mailOption = {
    from: "Grow-boo",
    to: user.email,
    subject: "Successfully registered",
    text: `Hello! ${user.fullName}
            Here is you user information - 
            Full Name: ${user.fullName}
            user ID: ${userId}
            Sponsor ID: ${user.sponsorId}
            Mobile: ${user.mobile}
            Email: ${user.email}`,
    html: `<div>
    <h1 style="text-align: center;">Welcome to <a href="https://grow-boo.com">Grow-boo</a></h1>
    <div  style="padding: 0 60px; width: 100%;">
            <h2>Hello! ${user.fullName},</h2>
            <p style="text-align: left;">Here is you ID information - </p>
            <p style="text-align: left; margin-left: 20px">Full Name: ${user.fullName}</p>
            <p style="text-align: left; margin-left: 20px">user ID: ${user.userId}</p>
            <p style="text-align: left; margin-left: 20px">Sponsor ID: ${user.sponsorId}</p>
            <p style="text-align: left; margin-left: 20px">Mobile: ${user.mobile}</p>
            <p style="text-align: left; margin-left: 20px">Email: ${user.email}</p>      
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

module.exports = sendConfirmRegistrationMail;
