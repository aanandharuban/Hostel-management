const { sendSMS } = require("./utils/smsService");

sendSMS("Test emergency SMS from Vasudevan 🚨")
  .then(() => console.log("✅ Test SMS done"))
  .catch(err => console.error("❌ SMS Test Error:", err));
