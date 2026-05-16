const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 465,
      secure: true,

      auth: {
        user: process.env.BREVO_EMAIL,
        pass: process.env.BREVO_SMTP_KEY,
      },
    });

    const info = await transporter.sendMail({
      from: '"E-Commerce Online Shopping Site" <khanmohdnawaz567@gmail.com>',
      to: options.email,
      subject: options.subject,
      html: options.message,
    });

    console.log("EMAIL SENT:", info);

  } catch (error) {
    console.log("EMAIL ERROR:", error);
  }
};

module.exports = sendEmail;