const mongoose = require("mongoose");

const wardenSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

// ✅ Prevent OverwriteModelError
module.exports = mongoose.models.Warden || mongoose.model("Warden", wardenSchema);
