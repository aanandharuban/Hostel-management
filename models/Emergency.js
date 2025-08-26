const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema({
  studentEmail: { type: String, required: true },
  type: { type: String },
  desc: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Emergency", emergencySchema);
