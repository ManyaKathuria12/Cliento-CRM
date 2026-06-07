const express = require("express");
const router = express.Router();
const User = require("../models/User");
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
      },
    });

  } catch (err) {
    console.log("LOGIN ERROR ❌", err);
    return res.status(500).json({ message: "Server error ❌" });
  }
});


// 🔥 UPDATE PROFILE
router.put("/profile/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { name, avatar } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          name,
          avatar,
        },
      },
      { new: true }
    );

    res.json(updatedUser);
  } catch (err) {
    console.log("PROFILE UPDATE ERROR:", err);
    res.status(500).json({ message: "Update failed ❌" });
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
    role: user.role, // 🔥 ADD
  },
});

  } catch (err) {
    console.log("GOOGLE LOGIN ERROR:", err);
    res.status(500).json({ message: "Google login failed ❌" });
  }
});

module.exports = router;