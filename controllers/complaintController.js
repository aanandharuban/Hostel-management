const Complaint = require("../models/Complaint");

// 👉 Student creates a complaint
// 👉 Student creates a complaint
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    // 🚨 Add validation for missing fields
    if (!title || !description || !category) {
      return res.status(400).json({ success: false, message: "Category and message required" });
    }

    const newComplaint = new Complaint({
      studentId: req.user.id,
      title,
      description,
      category,
    });

    await newComplaint.save();
    res.status(201).json({ success: true, complaint: newComplaint });

  } catch (err) {
    console.error("❌ Complaint creation error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 👉 Student views their own complaints
exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ studentId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 👉 Warden views all complaints
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().populate("studentId", "name email").sort({ createdAt: -1 });
    res.json({ success: true, complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 👉 Warden updates complaint status
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

    complaint.status = status;
    await complaint.save();

    res.json({ success: true, message: "Status updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
