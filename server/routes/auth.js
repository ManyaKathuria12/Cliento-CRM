const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Lead = require("../models/Lead");
const Deal = require("../models/Deal");
const Contact = require("../models/Contact");
const Task = require("../models/Task");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// =======================
// 🔐 SIGNUP
// =======================
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    // 🔥 VALIDATION
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required ❌" });
    }

    // 🔍 CHECK EXISTING USER
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists ❌" });
    }

    // 🔐 HASH PASSWORD
    const hashed = await bcrypt.hash(password, 10);

    // 💾 SAVE USER
  const user = await User.create({
  name,
  email,
  password: hashed,
  role: "sales", // 🔥 ADD THIS
});

    res.json({
      message: "Signup success ✅",
    user: {
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role, // 🔥 ADD
}
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error ❌" });
  }
});


// =======================
// 🔐 LOGIN
// =======================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔥 VALIDATION
    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields ❌" });
    }

    // 🔍 FIND USER
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "User not found ❌" });
    }

    // 🔐 GOOGLE USER CHECK
    if (!user.password) {
      return res.status(400).json({
        message: "Use Google login for this account ❌",
      });
    }

    console.log("👉 ENTERED:", password);
console.log("👉 DB PASSWORD:", user.password);
console.log("👉 IS HASHED:", user.password.startsWith("$2b$"));

    // 🔐 PASSWORD MATCH
   let isMatch = false;

// 🔥 check if password is hashed
if (user.password.startsWith("$2b$")) {
  isMatch = await bcrypt.compare(password, user.password);
} else {
  isMatch = password === user.password;
}

console.log("👉 MATCH RESULT:", isMatch);

if (!isMatch) {
  return res.status(401).json({ message: "Wrong password ❌" });
}


    // 🎫 TOKEN
    const token = jwt.sign(
      { id: user._id, role: user.role },
      "secret123",
      { expiresIn: "7d" }
    );

    // ✅ SUCCESS RESPONSE
    return res.json({
      message: "Login success ✅",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role || "sales",
        phone: user.phone || "",
        company: user.company || "",
        jobTitle: user.jobTitle || "",
        location: user.location || "",
      },
    });

  } catch (err) {
    console.log("LOGIN ERROR ❌", err);
    return res.status(500).json({ message: "Server error ❌" });
  }
});


// 🔥 GET PROFILE
router.get("/profile/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found ❌" });
    }
    res.json(user);
  } catch (err) {
    console.log("GET PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error fetching profile ❌" });
  }
});


// 🔥 GET PROFILE STATS
router.get("/profile-stats/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found ❌" });
    }

    const userName = user.name || "";
    
    const leadsCount = await Lead.countDocuments();
    const dealsCount = await Deal.countDocuments();
    const contactsCount = await Contact.countDocuments();
    
    const completedTasksCount = await Task.countDocuments({
      assignee: userName,
      $or: [{ done: true }, { status: "done" }]
    });

    res.json({
      leadsCount,
      dealsCount,
      contactsCount,
      completedTasksCount
    });
  } catch (err) {
    console.log("PROFILE STATS ERROR:", err);
    res.status(500).json({ message: "Error fetching profile stats" });
  }
});


// 🔥 GET PROFILE ACTIVITY
router.get("/profile-activity/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found ❌" });
    }

    const userName = user.name || "";
    const activities = [];

    // 1. Fetch latest leads (limit 3)
    const latestLeads = await Lead.find().sort({ createdAt: -1 }).limit(3);
    latestLeads.forEach(lead => {
      activities.push({
        id: `lead-${lead._id}`,
        title: "New Lead Created",
        desc: `Lead "${lead.name}" was created from source "${lead.source || "Direct"}".`,
        timestamp: lead.createdAt || lead.updatedAt || new Date(),
        category: "lead",
        colorClass: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      });
    });

    // 2. Fetch latest deal activities (limit 3 deals, process their activities)
    const latestDeals = await Deal.find().sort({ updatedAt: -1 }).limit(3);
    latestDeals.forEach(deal => {
      if (deal.activity && deal.activity.length > 0) {
        const latestAct = deal.activity[deal.activity.length - 1];
        activities.push({
          id: `deal-act-${deal._id}-${latestAct._id || Math.random()}`,
          title: "Deal Activity Updated",
          desc: `Deal "${deal.title}" value of ₹${deal.value || "0"}: ${latestAct.action}`,
          timestamp: latestAct.timestamp || deal.updatedAt || new Date(),
          category: "deal",
          colorClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        });
      }
    });

    // 3. Fetch completed tasks for this user (limit 3)
    const completedTasks = await Task.find({
      assignee: userName,
      $or: [{ done: true }, { status: "done" }]
    }).limit(3);
    completedTasks.forEach((task, idx) => {
      activities.push({
        id: `task-${task._id || idx}`,
        title: "Task Completed",
        desc: `You completed follow up task: "${task.text}"`,
        timestamp: new Date(Date.now() - idx * 24 * 60 * 60 * 1000),
        category: "task",
        colorClass: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
      });
    });

    // 4. Fetch latest contacts (limit 3)
    const latestContacts = await Contact.find().sort({ _id: -1 }).limit(3);
    latestContacts.forEach((contact, idx) => {
      activities.push({
        id: `contact-${contact._id || idx}`,
        title: "Contact Added",
        desc: `Added new client "${contact.name}" representing ${contact.company || "Individual"}.`,
        timestamp: new Date(Date.now() - (idx + 1) * 24 * 60 * 60 * 1000),
        category: "contact",
        colorClass: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      });
    });

    // Sort all by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json(activities.slice(0, 5));
  } catch (err) {
    console.log("PROFILE ACTIVITY ERROR:", err);
    res.status(500).json({ message: "Error fetching profile activity" });
  }
});


// 🔥 UPDATE PROFILE
router.put("/profile/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, company, jobTitle, location, avatar } = req.body;

    // Optional: check email usage
    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ message: "Email is already in use ❌" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          name,
          email,
          phone,
          company,
          jobTitle,
          location,
          avatar,
        },
      },
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    console.log("PROFILE UPDATE ERROR:", err);
    res.status(500).json({ message: "Update failed ❌" });
  }
});


// 🔥 CHANGE PASSWORD
router.put("/change-password/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "All password fields are required ❌" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found ❌" });
    }

    if (!user.password) {
      return res.status(400).json({ message: "Account registered via Google. Password change not supported. ❌" });
    }

    let isMatch = false;
    if (user.password.startsWith("$2b$")) {
      isMatch = await bcrypt.compare(oldPassword, user.password);
    } else {
      isMatch = oldPassword === user.password;
    }

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password ❌" });
    }

    // Hash and save new password
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "Password updated successfully ✅" });
  } catch (err) {
    console.log("CHANGE PASSWORD ERROR:", err);
    res.status(500).json({ message: "Change password failed ❌" });
  }
});


// =======================
// 🔐 GOOGLE LOGIN
// =======================
router.post("/google", async (req, res) => {
  try {
    const { name, email, sub, picture } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email missing ❌" });
    }

    // 🔍 CHECK USER
    let user = await User.findOne({ email });

    // 🆕 CREATE IF NOT EXISTS
    if (!user) {
      user = await User.create({
        name,
        email,
        googleId: sub,
        avatar: picture,
        role: "sales",
      });
    }

    // 🎫 TOKEN (optional but best)
    const token = jwt.sign(
      { id: user._id },
      "secret123",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Google login success ✅",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        phone: user.phone || "",
        company: user.company || "",
        jobTitle: user.jobTitle || "",
        location: user.location || "",
      },
    });

  } catch (err) {
    console.log("GOOGLE LOGIN ERROR:", err);
    res.status(500).json({ message: "Google login failed ❌" });
  }
});

module.exports = router;