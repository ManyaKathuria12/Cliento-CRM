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

// DELETE user
router.delete("/users/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

module.exports = router;