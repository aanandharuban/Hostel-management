const router = require("express").Router();
const verifyToken = require("../middleware/authMiddleware");

router.post("/", verifyToken, async (req, res) => {
  const { type, desc } = req.body;
  const user = req.user;

  try {
    console.log("🚨 Emergency Alert from", user.email);
    console.log("Type:", type, "| Desc:", desc);

    // You can also save it to a DB or trigger SMS here
    res.json({ success: true, message: "Emergency alert sent!" });
  } catch (err) {
    console.error("Emergency error:", err);
    res.status(500).json({ success: false, message: "Failed to send alert" });
  }
});

module.exports = router;
