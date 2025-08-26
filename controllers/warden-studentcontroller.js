const Student = require("../models/Student");

// @desc Get all students
// @route GET /api/warden/students
// @access Private (warden only)
exports.getAllStudents = async (req, res) => {
  try {
    if (req.user.role !== "warden") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const students = await Student.find().select("name email department year phone room block"); // exclude password
    res.json({ success: true, students });
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
  console.log("✅ getAllStudents controller reached");

};
