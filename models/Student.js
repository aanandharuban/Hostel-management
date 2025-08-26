const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  department: String,
  year: String,
  phone: String,
  room: String,
  block: String
});

module.exports = mongoose.model("Student", studentSchema);
