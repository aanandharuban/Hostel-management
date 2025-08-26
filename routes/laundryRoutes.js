const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const LaundrySession = require("../models/Laundry");

// 🧺 Book a Laundry Session
router.post("/schedule", verifyToken, async (req, res) => {
  try {
    const { machine, laundryType, itemCount, startTime } = req.body;

    if (!machine || !laundryType || !itemCount || !startTime) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const session = new LaundrySession({
      user: req.user.id, // ✅ Matches the model
      machine,
      laundryType,
      itemCount,
      startTime
    });

    await session.save();
    res.json({ success: true, session });
  } catch (err) {
    console.error("❌ Schedule error:", err.message);
    res.status(500).json({ success: false, message: "Failed to schedule session" });
  }
});

module.exports = router;
