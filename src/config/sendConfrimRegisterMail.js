const nodemailer = require("nodemailer");

const sendConfirmRegistrationMail = (user, userId) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: "info@grow-boo.com", // your Hostinger email
      pass: "6t=CYL~&9wO",
    },
  });

  const mailOption = {
    from: '"Grow-Boo International" <info@grow-boo.com>',
    to: user.email,
    subject: "🎉 Registration Successful – Welcome to Grow-Boo!",
    html: `
      <div style="width: 100%; background:#000; padding: 30px; font-family: Arial, sans-serif; color: #fff;">
        <div style="max-width: 600px; margin: auto; background:#111; border-radius:10px; padding:30px; border: 1px solid #edf100;">

          <h1 style="text-align:center; color:#edf100; margin-bottom:20px;">
            Welcome to Grow-Boo! 🚀
          </h1>

          <p style="font-size:16px;">Hi <strong style="color:#edf100;">${user.fullName}</strong>,</p>

          <p style="line-height:1.6; font-size:15px;">
            Your registration has been successfully completed.  
            Below are your account details—please keep them safe for future login and ID verification.
          </p>

          <h3 style="margin-top:25px; color:#edf100;">🔐 Your Account Information</h3>

          <div style="background:#000; padding:15px 20px; border-radius:8px; border-left:4px solid #edf100; margin-top:10px;">
            <p style="margin:6px 0;"><strong>Full Name:</strong> ${user.fullName}</p>
            <p style="margin:6px 0;"><strong>User ID:</strong> ${userId}</p>
            <p style="margin:6px 0;"><strong>Sponsor ID:</strong> ${user.sponsorId}</p>
            <p style="margin:6px 0;"><strong>Mobile:</strong> ${user.mobile}</p>
            <p style="margin:6px 0;"><strong>Email:</strong> ${user.email}</p>
          </div>

          <p style="margin-top:25px; font-size:15px; line-height:1.5;">
            You can now log in using your credentials and access your Grow-Boo dashboard.
          </p>

          <div style="text-align:center; margin:30px 0;">
            <a href="https://grow-boo.com/login"
              style="
                padding: 12px 25px; 
                background:#edf100; 
                color:#000; 
                font-weight:bold; 
                text-decoration:none; 
                border-radius:6px;
                font-size:16px;
              ">
              Go to Dashboard
            </a>
          </div>

          <p style="font-size:14px; color:#ccc;">
            If you did not create this account, please contact Grow-Boo Support immediately.
          </p>

          <br>

          <p style="font-size:15px;">Best Regards,</p>
          <p style="font-size:16px; color:#edf100; font-weight:bold;">Grow-Boo Team</p>

          <a href="https://grow-boo.com" style="color:#fff; text-decoration:none;">
            www.grow-boo.com
          </a>

        </div>
      </div>
    `,
  };

  transporter.sendMail(mailOption, async (error, info) => {
    if (error) {
      console.log("Email Error:", error);
    } else {
      console.log("Confirmation Email Sent:", info.response);
    }
  });
};

module.exports = sendConfirmRegistrationMail;
