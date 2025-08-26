const express = require("express");
const router = express.Router();
const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaintStatus
} = require("../controllers/complaintController");

const verifyToken = require("../middleware/authMiddleware");

// 🔒 Student
router.post("/", verifyToken, createComplaint);
router.get("/my", verifyToken, getMyComplaints);

// 🔒 Warden
router.get("/all", verifyToken, getAllComplaints);
router.put("/:id", verifyToken, updateComplaintStatus);

module.exports = router;
