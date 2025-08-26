const mongoose = require("mongoose");

const wardenSchema = new mongoose.Schema({
  name: String,
  age: Number,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  block: String,
  emergency1: { type: String, default: "Warden: +91-9876543210" },
  emergency2: { type: String, default: "Security: +91-9123456789" },
  emergency3: { type: String, default: "Medical: +91-9000012345" }
});

module.exports = mongoose.model("Warden", wardenSchema);
