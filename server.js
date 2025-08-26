// ✅ Auto-detect environment (no Linux-only syntax issues)
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = process.argv.includes("--prod") ? "production" : "development";
}

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const cron = require("node-cron");
const announcementRoutes = require('./routes/announcementRoutes');
const path = require("path");

// Load .env and connect DB
dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
 origin: "*", // or your production domain
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization"
}));
app.use(express.json());

// Models
const Student = require('./models/Student');
const Warden = require('./models/Warden');
const Complaint = require('./models/Complaint');
const Emergency = require('./models/Emergency');
const Laundry = require('./models/Laundry');

// Serve frontend only in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend")));
}

// JWT Auth Middleware
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: "Invalid token" });
  }
}

// 🔐 Login Route
app.post('/api/login', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    let user;
    if (role === 'student') {
      user = await Student.findOne({ email, password });
    } else if (role === 'warden') {
      user = await Warden.findOne({ email, password });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ email: user.email, role, id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ success: true, token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 📝 Student Registration
app.post('/api/register', async (req, res) => {
  const { email, name, room, block, password, year, phone, department } = req.body;

  if (!email || !name || !room || !block || !password || !year || !phone || !department) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  const existing = await Student.findOne({ email });
  if (existing) {
    return res.status(409).json({ success: false, message: "Email already registered" });
  }

  const newStudent = new Student({ email, name, room, block, password, year, phone, department });
  await newStudent.save();

  res.json({ success: true, message: "Student registered" });
});

// 👤 Get Student Profile
app.get('/api/student/profile', verifyToken, async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.user.email });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({
      success: true,
      student: {
        name: student.name,
        email: student.email,
        room: student.room,
        phone: student.phone,
        block: student.block
      }
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 📋 Student Complaint Submission
app.post('/api/complaints', verifyToken, async (req, res) => {
  try {
    const { category, title, description } = req.body;

    if (!category || !description || !title) {
      return res.status(400).json({ success: false, message: "Title, Category and Description required" });
    }

    const complaint = new Complaint({
      studentId: req.user.id,
      title,
      category,
      description,
      status: "Pending"
    });

    await complaint.save();
    res.json({ success: true, message: "Complaint submitted" });
  } catch (err) {
    console.error("Complaint error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 📋 Student View Their Complaints
app.get('/api/complaints', verifyToken, async (req, res) => {
  try {
    const complaints = await Complaint.find({ studentId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, complaints });
  } catch (err) {
    console.error("Fetch complaint error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 👨‍🏫 Warden View All Complaints
app.get('/api/warden/complaints', verifyToken, async (req, res) => {
  if (req.user.role !== 'warden') {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  try {
    const complaints = await Complaint.find().populate("studentId", "name email").sort({ createdAt: -1 });
    res.json({ success: true, complaints });
  } catch (err) {
    console.error("Warden complaint fetch error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🛠 Warden Update Complaint Status
app.put('/api/warden/complaints/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'warden') {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  const { status } = req.body;
  const validStatuses = ["Pending", "In Progress", "Resolved"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  try {
    const updated = await Complaint.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    res.json({ success: true, complaint: updated });
  } catch (err) {
    console.error("Status update error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🧺 Laundry Routes
const laundryRoutes = require('./routes/laundryRoutes');
app.use("/api/laundry",verifyToken, laundryRoutes);

// 🚨 Emergency Alert (Student sends alert)
const { sendSMS } = require('./utils/smsService');
app.post("/api/emergency", verifyToken, async (req, res) => {
  const { type, desc } = req.body;
  const user = req.user;

  const message = `🚨 EMERGENCY ALERT from ${user.email}.\n` +
                  (type ? `Type: ${type}\n` : "") +
                  (desc ? `Details: ${desc}` : "");

  try {
    await sendSMS(message);

    const alert = new Emergency({
      studentEmail: user.email,
      type,
      desc,
    });

    await alert.save();
    res.json({ success: true, message: "Alert sent!" });
  } catch (err) {
    console.error("Emergency error:", err);
    res.status(500).json({ success: false, message: "Failed to send alert" });
  }
});

// 📡 Warden View Emergency Alerts
app.get("/api/warden/emergencies", verifyToken, async (req, res) => {
  if (req.user.role !== 'warden') {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  try {
    const emergencies = await Emergency.find().sort({ timestamp: -1 });
    res.json({ success: true, emergencies });
  } catch (err) {
    console.error("Emergency fetch error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 📆 Scheduled Job: Auto-delete student records yearly
cron.schedule("0 0 30 6 *", async () => {
  try {
    const result = await Student.deleteMany({});
    console.log(`✅ Cleared ${result.deletedCount} student records for new academic year.`);
  } catch (err) {
    console.error("❌ Error clearing students:", err);
  }
});

// 🧾 Routes
const outingRoutes = require("./routes/outingRoutes");
const wardenRoutes = require("./routes/wardenRoutes");
const studentRoutes = require("./routes/studentRoutes");
const complaintRoutes = require("./routes/complaintRoutes");

app.use("/api/outing", outingRoutes);
app.use("/api/warden", wardenRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/students", studentRoutes); // Alias
app.use("/api/complaints", complaintRoutes);
app.use("/api/emergency", require("./routes/emergencyRoutes"));
app.use("/api/announcements", announcementRoutes);

// ✅ Default route
// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend");
  app.use(express.static(frontendPath));

  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

 else {
  app.get("/", (req, res) => {
    res.send("🎉 Hostel Management Server Running...");
  });
}

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`✅ Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
