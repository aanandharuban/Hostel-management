const Announcement = require('../models/announcementModel');

exports.createAnnouncement = async (req, res) => {
  try {
    console.log("📢 Incoming announcement:", req.body);

    const { heading, message } = req.body;
    if (!heading || !message) {
      return res.status(400).json({ success: false, message: "Missing heading or message" });
    }

    const announcement = await Announcement.create({ heading, message });

    console.log("✅ Saved announcement:", announcement);

    res.status(201).json({ success: true, announcement });
  } catch (err) {
    console.error("❌ Error saving announcement:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json({ success: true, announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error loading announcements" });
  }
};
