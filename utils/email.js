const nodemailer = require('nodemailer')

const sendEmail = async options => {
    // create a transporter
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    // define the email options
    const mailOptions = {
        from: 'Jonas Schmedtmann <hello@jonas.io>',
        to: options.email,
        subject: options.subject,
        text: options.message
    }
    //actually send the email
    await transport.sendMail(mailOptions)
}

module.exports = sendEmail