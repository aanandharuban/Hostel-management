const twilio = require("twilio");
const dotenv = require("dotenv");
dotenv.config();

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

exports.sendSMS = (message, to = process.env.EMERGENCY_PHONE) => {
  return client.messages
    .create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: to,
    })
    .then((msg) => console.log(`✅ SMS sent: ${msg.sid}`))
    .catch((err) => console.error("❌ SMS failed:", err));
};
