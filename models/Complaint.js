const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  status: {
    type: String,
    enum: ["Pending", "Resolved"],
    default: "Pending",
  },
}, { timestamps: true });

module.exports = mongoose.model("Complaint", complaintSchema);
