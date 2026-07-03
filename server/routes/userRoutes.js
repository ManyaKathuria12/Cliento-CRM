const express = require("express");
const router = express.Router();
const User = require("../models/User");

// GET users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password"); // 👈 password hide
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// UPDATE user role/status
router.put("/users/:id", async (req, res) => {
  try {
    const { role, disabled } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { role, disabled } },
      { new: true }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    try {
      req.app.get("io")?.emit("dashboardUpdated");
      req.app.get("io")?.emit("usersUpdated");
    } catch (e) {
      console.error("Failed to emit dashboardUpdated after user update", e);
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating user" });
  }
});

// DELETE user
router.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    try {
      req.app.get("io")?.emit("dashboardUpdated");
      req.app.get("io")?.emit("usersUpdated");
    } catch (e) {
      console.error("Failed to emit dashboardUpdated after user delete", e);
    }

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user" });
  }
});

module.exports = router;