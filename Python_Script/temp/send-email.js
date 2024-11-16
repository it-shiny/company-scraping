const nodemailer = require('nodemailer');

// Email configuration
const smtp_server = 'smtp.gmail.com';
const smtp_port = 587;
const sender_email = 'lightstar.it.golden@gmail.com'; // Replace with your email
const password = 'jrua hkns ovgu mzau';              // Replace with your password

// Email content
const subject = 'Your Subject Here';
const body = 'This is the body of the email.';

// Function to send an email
async function sendEmail(receiver_email) {
    try {
        // Create a transporter object
        let transporter = nodemailer.createTransport({
            host: smtp_server,
            port: smtp_port,
            secure: false, // true for 465, false for other ports
            auth: {
                user: sender_email,
                pass: password
            }
        });

        // Send mail with defined transport object
        let info = await transporter.sendMail({
            from: sender_email,
            to: receiver_email,
            subject: subject,
            text: body
        });

        console.log(`Email sent successfully to ${receiver_email}: ${info.messageId}`);
    } catch (e) {
        console.error(`Failed to send email to ${receiver_email}: ${e}`);
    }
}

// List of recipients
const recipients = ['bluepen0613.it@gmail.com', 'lightstar.it@outlook.com']; // Add your list of recipients

// Send emails
recipients.forEach(recipient => {
    sendEmail(recipient);
});
