const nodemailer = require("nodemailer");

const sendVerificationMail = async (user) => {
  const link = `https://grow-boo.com/login/${user?.token}`;

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
    from: '"Grow-Boo" <info@grow-boo.com>',
    to: user?.email,
    subject: "Welcome to Grow-Boo! Please Verify Your Email",
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
            color: #edf100; 
            margin-bottom: 20px;
          ">
            Welcome to Grow-Boo! 🚀
          </h2>

          <p style="font-size: 16px;">
            Hi <strong style="color:#edf100;">${
              user?.full_name || "User"
            }</strong>,
          </p>

          <p style="font-size: 15px; line-height: 1.6;">
            We're excited to have you join Grow-Boo!  
            To activate your account, please verify your email address by clicking the button below:
          </p>

          <!-- BUTTON -->
          <div style="text-align:center; margin: 35px 0;">
            <a 
              href="${link}"
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
              Verify My Email
            </a>
          </div>

        

          <p style="margin-top: 25px; font-size: 15px;">Once verified, you’ll be able to:</p>

          <ul style="line-height: 1.8; padding-left: 20px;">
            <li>Access your dashboard</li>
            <li>Explore all Grow-Boo tools</li>
            <li>Receive updates, tips and support</li>
            <li>Start growing with us</li>
          </ul>

          <p style="margin-top: 25px; font-size: 14px;">
            If you didn’t create an account with Grow-Boo, you may safely ignore this email.
          </p>

          <br />

          <p style="font-size: 15px; line-height: 1.5;">
            Thanks for joining the Grow-Boo community!  
            We're here to support your growth every step of the way.
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

  transporter.sendMail(mailOptions, async (error, info) => {
    if (error) {
      console.log("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

module.exports = sendVerificationMail;
