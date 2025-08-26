const express = require("express");
const router = express.Router();

const {
  createOuting,
  getOutings,
  markReturn,
  getAllOutingRequests,
  updateOutingStatus
} = require("../controllers/outingController");

const verifyToken = require("../middleware/authMiddleware");

// 👨‍🎓 STUDENT ROUTES
// POST /api/outing - Student submits outing request
router.post("/", verifyToken, createOuting);

// GET /api/outing - Student views their own outings
router.get("/", verifyToken, getOutings);

// PUT /api/outing/return - Mark outing as returned
router.put("/return", verifyToken, markReturn);

// 👨‍🏫 WARDEN ROUTES
// GET /api/outing/warden - Warden views all outing requests
router.get("/warden", verifyToken, getAllOutingRequests);

// PUT /api/outing/:id/status - Warden approves/rejects outing
router.put("/:id/status", verifyToken, updateOutingStatus);

module.exports = router;
