const nodemailer = require("nodemailer");

const sendMessageEmail = (name, user_id, email, message, subject, mobile) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: "info@grow-boo.com",
      pass: "6t=CYL~&9wO",
    },
  });

  const messageBody = `
  <div style="width:100%; background:#000; padding:25px; color:#fff; font-family:Arial;">
    <div style="max-width:600px; margin:auto; background:#111; padding:25px; border-radius:8px; border:1px solid #edf100;">
      
      <h2 style="color:#edf100; margin-bottom:20px;">New Message Received</h2>

      <p style="font-size:16px; line-height:1.6;">${message}</p>

      <div style="margin-top:25px; padding:15px; border:1px solid #222; border-radius:6px; background:#000;">
        <p><strong style="color:#edf100;">Name:</strong> ${name}</p>
        <p><strong style="color:#edf100;">Email:</strong> ${email}</p>
        <p><strong style="color:#edf100;">User ID:</strong> ${user_id}</p>
        <p><strong style="color:#edf100;">Mobile:</strong> ${mobile}</p>
      </div>
      
      <p style="margin-top:25px; color:#ccc;">This message was sent to your admin inbox.</p>
    </div>
  </div>
  `;

  const mailOption = {
    from: `"Grow-Boo Message" <info@grow-boo.com>`,
    to: "info@grow-boo.com",
    subject: subject,
    html: messageBody,
  };

  transporter.sendMail(mailOption, (error, info) => {
    if (error) {
      console.log("Email sending error:", error);
    } else {
      console.log("Message email sent:", info.response);
    }
  });
};

module.exports = sendMessageEmail;
