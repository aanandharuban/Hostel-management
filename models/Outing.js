const mongoose = require("mongoose");

const OutingSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  reason: String,
  destination: String,
  fromDate: Date,
  toDate: Date,
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" }
}, { timestamps: true });

module.exports = mongoose.model("Outing", OutingSchema);
