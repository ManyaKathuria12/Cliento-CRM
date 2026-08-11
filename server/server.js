require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const multer = require("multer");
const mongoose = require("mongoose");
const { rateLimit } = require("express-rate-limit");
const authRoutes = require("./routes/auth");
const contactRoutes = require("./routes/contact");
const leadRoutes = require("./routes/lead");
const User = require("./models/User");
const dealRoutes = require("./routes/deals");
const taskRoutes = require("./routes/tasks");
const dashboardRoutes = require("./routes/dashboard");
const userRoutes = require("./routes/userRoutes");
const publicRoutes = require("./routes/public");
const notificationRoutes = require("./routes/notifications");




const app = express();

const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);

const allowedOrigins = [
  // Local dev
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://localhost:8080",
  "http://localhost:8081",
  "http://localhost:8082",
  // Production — set these in Render's environment variables
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ["websocket", "polling"]
});

io.on("connection", (socket) => {
  console.log("Socket connected", socket.id);
  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected", socket.id, reason);
  });
});

app.set("io", io);

const migrateDatabase = async () => {
  try {
    const Lead = require("./models/Lead");
    const Contact = require("./models/Contact");
    const Deal = require("./models/Deal");
    const Task = require("./models/Task");
    const Notification = require("./models/Notification");
    const Activity = require("./models/Activity");

    // Only migrate records that have no owner assigned yet
    const unownedLeads = await Lead.countDocuments({ createdBy: { $exists: false } });
    if (unownedLeads === 0) {
      console.log("✅ No orphaned records to migrate.");
      return;
    }

    // Find the first admin/owner user in the database dynamically
    const targetUser = await User.findOne({ role: { $in: ["admin", "owner", "sales"] } }).sort({ createdAt: 1 });
    if (!targetUser) {
      console.log("⚠️  No users found in database — skipping migration.");
      return;
    }
    const targetUserId = targetUser._id;

    // Migrate Leads
    const leadsResult = await Lead.updateMany({ createdBy: { $exists: false } }, { $set: { createdBy: targetUserId } });
    if (leadsResult.modifiedCount > 0) {
      console.log(`✅ Migrated ${leadsResult.modifiedCount} Leads to user ${targetUser.email}`);
    }

    // Migrate Contacts
    const contactsResult = await Contact.updateMany({ createdBy: { $exists: false } }, { $set: { createdBy: targetUserId } });
    if (contactsResult.modifiedCount > 0) {
      console.log(`✅ Migrated ${contactsResult.modifiedCount} Contacts to user ${targetUser.email}`);
    }

    // Migrate Deals
    const dealsResult = await Deal.updateMany({ createdBy: { $exists: false } }, { $set: { createdBy: targetUserId } });
    if (dealsResult.modifiedCount > 0) {
      console.log(`✅ Migrated ${dealsResult.modifiedCount} Deals to user ${targetUser.email}`);
    }

    // Migrate Tasks
    const tasksResult = await Task.updateMany({ createdBy: { $exists: false } }, { $set: { createdBy: targetUserId } });
    if (tasksResult.modifiedCount > 0) {
      console.log(`✅ Migrated ${tasksResult.modifiedCount} Tasks to user ${targetUser.email}`);
    }

    // Migrate Notifications
    const notificationsResult = await Notification.updateMany({ createdBy: { $exists: false } }, { $set: { createdBy: targetUserId } });
    if (notificationsResult.modifiedCount > 0) {
      console.log(`✅ Migrated ${notificationsResult.modifiedCount} Notifications to user ${targetUser.email}`);
    }

    // Migrate Activities
    const activitiesResult = await Activity.updateMany({ createdBy: { $exists: false } }, { $set: { createdBy: targetUserId } });
    if (activitiesResult.modifiedCount > 0) {
      console.log(`✅ Migrated ${activitiesResult.modifiedCount} Activities to user ${targetUser.email}`);
    }

  } catch (err) {
    console.error("❌ Database migration failed:", err);
  }
};

// 🔥 MONGODB CONNECT
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cliento")
  .then(async () => {
    console.log("MongoDB connected 🔥");
    await migrateDatabase();
  })
  .catch(err => console.log(err));

// 🔥 MIDDLEWARE
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

// 🛡️ Body size limit — prevents large payload attacks
app.use(express.json({ limit: "5mb" }));
app.use("/uploads", express.static("uploads"));

// 🛡️ General API rate limit — 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

// 🛡️ Auth rate limit — max 10 login/signup attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts, please try again in 15 minutes." },
});

app.use("/api", generalLimiter);
app.use("/api/public", publicRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api", userRoutes);

// 🔐 AUTH ROUTES — with strict rate limiting
app.use("/api/auth", authLimiter, authRoutes);

app.use("/api/leads", leadRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/deals", dealRoutes);

// 📸 MULTER SETUP
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// 📸 UPLOAD API
app.post("/upload", upload.single("avatar"), (req, res) => {
  res.json({ file: req.file.filename });
});

// 📧 EMAIL TRANSPORTER
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});



// 🔥 FORGOT PASSWORD
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email is required" });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password`;

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Password Reset",
      html: `
        <h2>Password Reset</h2>
        <p>Click below:</p>
        <a href="${resetLink}">${resetLink}</a>
      `,
    });

    res.json({ message: "Email sent ✅" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Email failed ❌" });
  }
});



// ✅ Serve React frontend in production
const distPath = path.join(__dirname, "../Client/dist");
app.use(express.static(distPath));

// ✅ SPA fallback — return index.html for all non-API routes so React Router works on refresh
app.get(/.*/, (req, res) => {
  // Don't intercept API or upload routes
  if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
    return res.status(404).json({ error: "Not found" });
  }
  res.sendFile(path.join(distPath, "index.html"));
});

// 🚀 START SERVER
const PORT = process.env.PORT || 5000;

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. Stop the other process or set a different PORT in .env.`
    );
  } else {
    console.error("Server error:", err);
  }
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});