const express = require("express");
const router = express.Router();
const { createAnnouncement, getAnnouncements } = require("../controllers/announcementController");
const verifyToken = require("../middleware/authMiddleware");

// POST: Warden posts (requires auth)
router.post("/", verifyToken, createAnnouncement);

// GET: Students fetch — no auth needed
router.get("/", getAnnouncements); // 🟢 Remove verifyToken here

module.exports = router;
