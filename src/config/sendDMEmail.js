const nodemailer = require("nodemailer");

const sendDMEmail = async (clientEmail) => {
  // 1. Setup Transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: "info@grow-boo.com",
      pass: "6t=CYL~&9wO", // ⚠️ Reminder: Move this to an Environment Variable (.env)
    },
  });

  // 2. Define the Email Design
  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0; padding:0; background-color:#020617; font-family: 'Segoe UI', Arial, sans-serif;">
    
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#020617;">
      <tr>
        <td align="center" style="padding: 40px 10px;">
          
          <!-- Main Container -->
          <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color:#0f172a; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden;">
            
            <!-- Header Gradient -->
            <tr>
              <td style="height: 6px; background: linear-gradient(90deg, #f97316, #a855f7);"></td>
            </tr>

            <!-- Logo Section -->
            <tr>
              <td align="center" style="padding: 40px 20px 20px 20px;">
                <h1 style="color:#ffffff; margin:0; font-size: 32px; letter-spacing: 2px; font-weight: 800;">
                  WEVLIOX<span style="color:#f97316;">.</span>
                </h1>
                <p style="color: #94a3b8; font-size: 14px; text-transform: uppercase; letter-spacing: 3px; margin-top: 5px;">Digital Solutions Agency</p>
              </td>
            </tr>

            <!-- Content Body -->
            <tr>
              <td style="padding: 20px 40px 40px 40px; color: #cbd5e1; line-height: 1.6; font-size: 16px;">
                <h2 style="color: #ffffff; font-size: 24px; margin-bottom: 20px; text-align: center;">Transforming Ideas into <span style="color:#f97316;">Scalable Realities</span></h2>
                
                <p>Hello,</p>
                <p>Are you looking to elevate your digital presence or streamline your business operations? At <strong>Wevliox</strong>, we specialize in building high-performance software tailored to your specific goals.</p>
                
                <p style="color: #ffffff; font-weight: 600; margin-bottom: 10px;">How we can help you Grow:</p>
                
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding-bottom: 10px;">
                      <div style="background: #1e293b; padding: 15px; border-radius: 8px; border-left: 4px solid #f97316;">
                        <span style="color:#f97316;">✔</span> &nbsp; <strong style="color:#fff;">E-Commerce & Catalogs:</strong> High-converting online stores.
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 10px;">
                      <div style="background: #1e293b; padding: 15px; border-radius: 8px; border-left: 4px solid #a855f7;">
                        <span style="color:#a855f7;">✔</span> &nbsp; <strong style="color:#fff;">Advanced MLM Systems:</strong> Binary, Unilevel, & Hybrid plans.
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 10px;">
                      <div style="background: #1e293b; padding: 15px; border-radius: 8px; border-left: 4px solid #f97316;">
                        <span style="color:#f97316;">✔</span> &nbsp; <strong style="color:#fff;">Game Dev & Custom Apps:</strong> Prediction games & specialized web apps.
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 10px;">
                      <div style="background: #1e293b; padding: 15px; border-radius: 8px; border-left: 4px solid #a855f7;">
                        <span style="color:#a855f7;">✔</span> &nbsp; <strong style="color:#fff;">Mobile & Maintenance:</strong> App development & expert bug fixing.
                      </div>
                    </td>
                  </tr>
                </table>

                <p style="margin-top: 25px;">We don't just write code; we build tools that drive revenue. From secure payment integrations to responsive designs, we handle the tech so you can focus on the business.</p>

                <!-- Call to Action Buttons -->
                <div style="text-align: center; padding-top: 20px;">
                  <a href="https://wevliox.vercel.app/" style="background: linear-gradient(90deg, #f97316 0%, #a855f7 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin-right: 10px; box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3);">View Our Portfolio</a>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #020617; padding: 30px; text-align: center; border-top: 1px solid #1e293b;">
                <p style="margin: 0; color: #64748b; font-size: 13px;">&copy; 2025 Wevliox Development Team</p>
                <div style="margin-top: 15px;">
                  <a href="https://wevliox.vercel.app/" style="color: #f97316; text-decoration: none; font-size: 13px;">Website</a> 
                  <span style="color: #334155;"> | </span>
                  <a href="mailto:weblioxbd@gmail.com" style="color: #f97316; text-decoration: none; font-size: 13px;">Contact Support</a>
                </div>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;

  // 3. Email Options
  const mailOptions = {
    from: `"Wevliox Development" <info@grow-boo.com>`,
    to: clientEmail,
    subject: "Scale your business with custom software & MLM solutions 🚀",
    html: htmlContent,
  };

  // 4. Send
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Success: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Error:", error);
  }
};

module.exports = sendDMEmail;
