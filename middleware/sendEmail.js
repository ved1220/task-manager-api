const nodemailer = require('nodemailer');
require('dotenv').config();


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,           
  port: process.env.SMTP_PORT,          
  secure: true, 
  auth: {
    user: process.env.EMAIL,             
    pass: process.env.EMAIL_PASSWORD,    
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Error setting up email transporter:', error);
  } else {
    console.log('Email transporter is ready to send messages');
  }
});

const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL, 
    to,                      
    subject,                 
    text,                    
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email not sent');
  }
};

module.exports = sendEmail;
