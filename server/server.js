require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const multer = require("multer");
const mongoose = require("mongoose");
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

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ["websocket"] // 🔥 ADD THIS
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

    // Target user is the original sales demo account (Manya Kathuria)
    const targetUserId = "69ef9f0044d8abb2c360b923";
    const user = await User.findById(targetUserId);
    if (!user) {
      console.log("⚠️ Original demo user (Manya Kathuria) not found in database.");
      return;
    }

    // Migrate Leads
    const leadsResult = await Lead.updateMany({ createdBy: { $exists: false } }, { $set: { createdBy: targetUserId } });
    if (leadsResult.modifiedCount > 0) {
      console.log(`✅ Migrated ${leadsResult.modifiedCount} Leads to Original User ${user.email}`);
    }

    // Migrate Contacts
    const contactsResult = await Contact.updateMany({ createdBy: { $exists: false } }, { $set: { createdBy: targetUserId } });
    if (contactsResult.modifiedCount > 0) {
      console.log(`✅ Migrated ${contactsResult.modifiedCount} Contacts to Original User ${user.email}`);
    }

    // Migrate Deals
    const dealsResult = await Deal.updateMany({ createdBy: { $exists: false } }, { $set: { createdBy: targetUserId } });
    if (dealsResult.modifiedCount > 0) {
      console.log(`✅ Migrated ${dealsResult.modifiedCount} Deals to Original User ${user.email}`);
    }

    // Migrate Tasks
    const tasksResult = await Task.updateMany({ createdBy: { $exists: false } }, { $set: { createdBy: targetUserId } });
    if (tasksResult.modifiedCount > 0) {
      console.log(`✅ Migrated ${tasksResult.modifiedCount} Tasks to Original User ${user.email}`);
    }

    // Migrate Notifications
    const notificationsResult = await Notification.updateMany({ createdBy: { $exists: false } }, { $set: { createdBy: targetUserId } });
    if (notificationsResult.modifiedCount > 0) {
      console.log(`✅ Migrated ${notificationsResult.modifiedCount} Notifications to Original User ${user.email}`);
    }

    // Migrate Activities
    const activitiesResult = await Activity.updateMany({ createdBy: { $exists: false } }, { $set: { createdBy: targetUserId } });
    if (activitiesResult.modifiedCount > 0) {
      console.log(`✅ Migrated ${activitiesResult.modifiedCount} Activities to Original User ${user.email}`);
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
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api/public", publicRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api", userRoutes);


// 🔐 AUTH ROUTES (LOGIN / SIGNUP)
app.use("/api/auth", authRoutes);

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
    user: process.env.GMAIL_USER || "manyakathuria12@gmail.com",
    pass: process.env.GMAIL_PASS || "onqo jbnr cifo qyjb", // app password
  },
});



// 🔥 FORGOT PASSWORD (basic version)
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  const resetLink = `${process.env.FRONTEND_URL || "http://localhost:8080"}/reset-password`;

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER || "manyakathuria12@gmail.com",
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



// ✅ TEST
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// 🚀 START SERVER
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});