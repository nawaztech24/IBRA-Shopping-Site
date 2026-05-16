const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // verify transporter
    await transporter.verify();

    console.log("Transporter verified");

    const info = await transporter.sendMail({
      from: `"E-Commerce Online Shopping Site" <${process.env.EMAIL_USER}>`,
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