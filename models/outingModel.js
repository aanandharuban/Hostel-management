const mongoose = require("mongoose");

const outingSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  destination: String,
  purpose: String,
  duration: Number,
  returned: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
  type: String,
  enum: ['Pending', 'Approved', 'Rejected'],
  default: 'Pending'
},
notifiedWarden: {
  type: Boolean,
  default: false
}

});

module.exports = mongoose.models.Outing || mongoose.model("Outing", outingSchema);
