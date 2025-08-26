const Emergency = require("../models/Emergency");

exports.sendEmergency = async (req, res) => {
  try {
    const { type, description } = req.body;

    if (!type) {
      return res.status(400).json({ success: false, message: "Type required" });
    }

    const emergency = new Emergency({
      studentId: req.user.id,
      type,
      description,
    });

    await emergency.save();
    res.json({ success: true, emergency });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getMyEmergencies = async (req, res) => {
  try {
    const alerts = await Emergency.find({ studentId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, emergencies: alerts });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAllEmergencies = async (req, res) => {
  try {
    if (req.user.role !== "warden") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const alerts = await Emergency.find()
      .populate("studentId", "name email room")
      .sort({ createdAt: -1 });

    res.json({ success: true, emergencies: alerts });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

