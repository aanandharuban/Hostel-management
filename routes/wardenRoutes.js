// backend/routes/wardenRoutes.js

const express = require("express");
const router = express.Router();
const {
  registerWarden,
  loginWarden,
  getWardenProfile,
  updateWardenProfile,
  getAllStudents,
} = require("../controllers/wardenController");
const { deleteStudent } = require("../controllers/wardenController");
const verifyToken = require("../middleware/authMiddleware");
const {
  getAllOutingRequests,
  updateOutingStatus,
} = require("../controllers/outingController");

router.get("/outings", verifyToken, getAllOutingRequests);
router.put("/outings/:id/status", verifyToken, updateOutingStatus);

router.post("/register", registerWarden);
router.post("/login", loginWarden);
router.get("/profile", verifyToken, getWardenProfile);
router.put("/profile", verifyToken, updateWardenProfile);

// ✅ Correct student route for warden
router.get("/students", verifyToken, getAllStudents);
router.delete("/students/:id", verifyToken, deleteStudent);

module.exports = router;


