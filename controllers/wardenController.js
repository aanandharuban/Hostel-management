// backend/controllers/wardenController.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Warden = require("../models/Warden");
const Student = require("../models/Student");

// ✅ Register Warden
const registerWarden = async (req, res) => {
  try {
    const { name, age, email, password, phone, block } = req.body;

    if (!name || !age || !email || !password || !phone || !block) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existing = await Warden.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Warden already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newWarden = new Warden({ name, age, email, phone, block, password: hashedPassword });
    await newWarden.save();

    res.status(201).json({ success: true, message: "Warden registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Login Warden
const loginWarden = async (req, res) => {
  const { email, password } = req.body;

  try {
    const warden = await Warden.findOne({ email });
    if (!warden) {
      return res.status(401).json({ success: false, message: "Warden not found" });
    }

    const isMatch = await bcrypt.compare(password, warden.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: warden._id, role: "warden" }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    res.json({ success: true, token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get Warden Profile
const getWardenProfile = async (req, res) => {
  try {
    const warden = await Warden.findById(req.user.id).select("name email phone block");
    if (!warden) {
      return res.status(404).json({ success: false, message: "Warden not found" });
    }

    res.json({ success: true, warden });
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Update Warden Profile
const updateWardenProfile = async (req, res) => {
  try {
    const warden = await Warden.findById(req.user.id);
    if (!warden) {
      return res.status(404).json({ success: false, message: "Warden not found" });
    }

    const { name, phone, block } = req.body;
    if (name) warden.name = name;
    if (phone) warden.phone = phone;
    if (block) warden.block = block;

    await warden.save();
    res.json({ success: true, message: "Profile updated" });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get All Students (for Warden)
const getAllStudents = async (req, res) => {
  try {
    if (req.user.role !== "warden") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const students = await Student.find();
    res.json({ success: true, students });
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.deleteStudent = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
const deleteStudent = async (req, res) => {
  try {
    if (req.user.role !== "warden") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.json({ success: true, message: "Student deleted successfully" });
  } catch (err) {
    console.error("Delete student error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Export all
module.exports = {
  registerWarden,
  loginWarden,
  getWardenProfile,
  updateWardenProfile,
  getAllStudents, // ✅ Don't forget this
  deleteStudent
};


