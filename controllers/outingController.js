const Outing = require("../models/outingModel");
const { sendSMS } = require("../utils/smsService");
const Student = require("../models/Student");
// ✅ Create a new outing
exports.createOuting = async (req, res) => {
  try {
    const { destination, purpose, duration } = req.body;

    const outing = await Outing.create({
      studentId: req.user.id,
      destination,
      purpose,
      duration,
      returned: false,
      status: "Pending", // 🆕 pending approval
      notifiedWarden: false
    });
    

    // No SMS yet — only after approval

    res.status(201).json({ success: true, outing });
  } catch (err) {
    console.error("❌ Error creating outing:", err);
    res.status(500).json({ success: false, message: "Server error while creating outing." });
  }
};


// ✅ Get all outings for logged-in student
exports.getOutings = async (req, res) => {
  try {
    const outings = await Outing.find().populate("studentId", "name"); // fetch all outings + student name

    res.json({ success: true, outings });
  } catch (err) {
    console.error("❌ Error fetching outings:", err);
    res.status(500).json({ success: false, message: "Error fetching outing history." });
  }
};

// ✅ Mark the latest outing as returned
exports.markReturn = async (req, res) => {
  try {
    const lastOuting = await Outing.findOne({
      studentId: req.user.id,
      returned: false
    }).sort({ createdAt: -1 });

    if (!lastOuting) {
      return res.status(404).json({ success: false, message: "No active outing found." });
    }

    lastOuting.returned = true;
    await lastOuting.save();

    // 🟡 Optional: SMS on return
    try {
      await sendSMS("✅ Student has returned to the hostel safely.");
    } catch (smsErr) {
      console.warn("⚠️ Return SMS failed:", smsErr.message);
    }

    res.json({ success: true, message: "Return marked successfully." });
  } catch (err) {
    console.error("❌ Error marking return:", err);
    res.status(500).json({ success: false, message: "Error marking return." });
  }
};
const getPendingOutings = async (req, res) => {
  try {
    const outings = await Outing.find({ status: "Pending" }).populate("studentId", "name year phone department");
    res.json({ success: true, outings });
  } catch (err) {
    console.error("❌ Failed to fetch outings:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Approve or Reject an outing
const updateOutingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const outing = await Outing.findById(id).populate("studentId", "name phone");
    if (!outing) return res.status(404).json({ success: false, message: "Outing not found" });

    outing.status = status;
    outing.notifiedWarden = true;
    await outing.save();

    if (status === "Approved") {
      // Send SMS or notification logic
      const { name, phone } = outing.studentId;
      const { destination, purpose, duration } = outing;
      const smsMsg = `✅ ${name} allowed to go to ${destination} for ${purpose} (for ${duration} hour(s)).`;
      try {
        await require("../utils/smsService").sendSMS(smsMsg);
      } catch (e) {
        console.warn("⚠️ SMS error:", e.message);
      }
    }

    res.json({ success: true, message: `Outing ${status.toLowerCase()} successfully.` });
  } catch (err) {
    console.error("❌ Error updating outing status:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// ✅ Get all outing requests (for warden)
exports.getAllOutingRequests = async (req, res) => {
  try {
    const outings = await Outing.find().populate("studentId", "name email");
    const formatted = outings.map(o => ({
      _id: o._id,
      studentName: o.studentId?.name || "Unknown",
      destination: o.destination,
      purpose: o.purpose,
      duration: o.duration,
      status: o.status
    }));
    res.json({ success: true, outings: formatted });
  } catch (err) {
    console.error("❌ Error loading outings:", err);
    res.status(500).json({ success: false, message: "Failed to load outings" });
  }
};


// ✅ Update outing status (approve/reject)
exports.updateOutingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["Approved", "Rejected"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  try {
    const outing = await Outing.findById(id).populate("studentId", "name phone");
    if (!outing) return res.status(404).json({ success: false, message: "Outing not found" });

    outing.status = status;
    outing.notifiedWarden = true;
    await outing.save();

    // Optional SMS if approved
    if (status === "Approved") {
      const { name, phone } = outing.studentId;
      const smsMsg = `✅ ${name} allowed to go to ${outing.destination} for ${outing.purpose}.`;
      try {
        await require("../utils/smsService").sendSMS(smsMsg);
      } catch (e) {
        console.warn("SMS failed:", e.message);
      }
    }

    res.json({ success: true, message: `Outing ${status.toLowerCase()} successfully.` });
  } catch (err) {
    console.error("❌ Error updating outing status:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
