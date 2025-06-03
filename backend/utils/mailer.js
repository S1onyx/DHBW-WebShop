const nodemailer = require('nodemailer');

const isDevMode = process.env.NODE_ENV === 'development' || process.env.DEV_MODE === 'true';

// Im Dev-Modus lokal verbinden, sonst im Docker auf den Mailpit-Container
const mailHost = isDevMode ? 'localhost' : process.env.MAIL_HOST || 'mailpit';
const mailPort = parseInt(process.env.MAIL_PORT) || 1025;
const mailFrom = process.env.MAIL_FROM || 'Webshop <no-reply@webshop.local>';

console.log('[MAIL DEBUG]', { mailHost, mailPort, mailFrom });

const transporter = nodemailer.createTransport({
  host: mailHost,
  port: mailPort,
  secure: false,
  tls: { rejectUnauthorized: false },
});

function sendMail({ to, subject, html }) {
  return transporter.sendMail({
    from: mailFrom,
    to,
    subject,
    html,
  }).catch(err => {
    console.error('[MAIL ERROR]', err.message);
  });
}

module.exports = sendMail;