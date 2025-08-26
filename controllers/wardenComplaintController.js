const Complaint = require("../models/Complaint");
const Student = require("../models/Student");

// 🔍 Get all student complaints
exports.getAllComplaints = async (req, res) => {
  try {
    if (req.user.role !== "warden") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const complaints = await Complaint.find()
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, complaints });
  } catch (err) {
    console.error("Get complaints error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Update complaint status
exports.updateComplaintStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    if (req.user.role !== "warden") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    complaint.status = status;
    await complaint.save();

    res.json({ success: true, message: "Complaint status updated" });
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
