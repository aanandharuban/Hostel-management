const mongoose = require("mongoose");

const LaundrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  machine: { type: String, required: true },
  laundryType: { type: String, required: true },
  itemCount: { type: Number, required: true },
  startTime: { type: Date, required: true },
  status: { type: String, enum: ["Active", "Completed"], default: "Active" }
}, { timestamps: true });

module.exports = mongoose.model("Laundry", LaundrySchema);
