const Student = require("../models/Student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const LaundrySession = require("../models/Laundry"); // ✅ Add this at the top


exports.loginStudent = async (req, res) => {
  const { email, password } = req.body;

  try {
    const student = await Student.findOne({ email });
    if (!student) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: student._id, email: student.email, role: "student" }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ success: true, token });
  } catch (err) {
    console.error("❌ Student login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// ✅ Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ year: 1 });
    res.json({ success: true, students });
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✏️ Update student
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });
    res.json({ success: true, student });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ❌ Delete student
exports.deleteStudent = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Register new student
exports.registerStudent = async (req, res) => {
  try {
    const { name, email, password, department, year, phone, room, block } = req.body;

    if (!name || !email || !password || !department || !year || !phone || !room || !block) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existing = await Student.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Student already registered" });
    }

    // ✅ Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = new Student({
      name,
      email,
      password: hashedPassword, // ✅ store hashed password
      department,
      year,
      phone,
      room,
      block
    });

    await newStudent.save();

    res.status(201).json({ success: true, message: "Student registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// POST /api/complaints
// 👉 Student creates a complaint
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category } = req.body; // <-- expects "description"
    const newComplaint = new Complaint({
      studentId: req.user.id,
      title,
      description,
      category,
    });
    await newComplaint.save();
    res.status(201).json({ success: true, complaint: newComplaint });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// laundryController.js
exports.scheduleLaundry = async (req, res) => {
  try {
    console.log("📥 Laundry booking received:", req.body); // ✅ Add this

    const { machine, laundryType, itemCount, startTime } = req.body;
    const userId = req.user.id; // make sure req.user exists (from auth middleware)

    // Optional validation
    if (!machine || !laundryType || !itemCount || !startTime) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const session = await LaundrySession.create({
      user: userId,
      machine,
      laundryType,
      itemCount: Number(itemCount),
      startTime: new Date(startTime),
      status: "Active"
    });

    res.status(200).json({ success: true, session });
  } catch (err) {
    console.error("❌ Laundry schedule error:", err); // 🔥 Show actual error
    res.status(500).json({ success: false, message: "Failed to schedule session" });
  }
};
