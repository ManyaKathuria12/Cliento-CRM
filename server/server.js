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
  console.log("User connected");
});

app.set("io", io);

// 🔥 MONGODB CONNECT
mongoose.connect("mongodb://127.0.0.1:27017/cliento")
  .then(() => console.log("MongoDB connected 🔥"))
  .catch(err => console.log(err));

// 🔥 MIDDLEWARE
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);
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
    user: "manyakathuria12@gmail.com",
    pass: "onqo jbnr cifo qyjb", // app password
  },
});



// 🔥 FORGOT PASSWORD (basic version)
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  const resetLink = `http://localhost:8080/reset-password`;

  try {
    await transporter.sendMail({
      from: "manyakathuria12@gmail.com",
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



// 📊 LEADS API
let leads = [];

app.get("/api/leads", (req, res) => {
  res.json(leads);
});

app.post("/api/leads", (req, res) => {
  const newLead = req.body;
  leads.push(newLead);
  res.json({ message: "Lead added", data: newLead });
});

app.delete("/api/leads/:id", (req, res) => {
  const id = req.params.id;
  leads.splice(id, 1);
  res.json({ message: "Lead deleted" });
});

app.put("/api/leads/:id", (req, res) => {
  const id = req.params.id;
  leads[id] = req.body;
  res.json({ message: "Lead updated", data: leads[id] });
});

// ✅ TEST
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// 🚀 START SERVER
server.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});