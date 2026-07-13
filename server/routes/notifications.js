const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const Task = require("../models/Task");
const authMiddleware = require("../middleware/auth");

router.use(authMiddleware);

// GET all notifications (DB + Dynamic Task Overdue stored to DB)
router.get("/", async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { createdBy: req.user.id };

    // 1. Scan for overdue tasks and save to DB if new
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdueTasks = await Task.find({
      ...filter,
      done: false,
      status: { $ne: "done" },
      due: { $exists: true, $ne: "" },
    });

    for (const t of overdueTasks) {
      const dueDate = new Date(t.due);
      if (dueDate < today) {
        const description = `Task "${t.text}" is overdue. It was due on ${dueDate.toLocaleDateString()}.`;
        const exists = await Notification.findOne({
          ...filter,
          title: "Task Overdue ⏰",
          description: description
        });
        if (!exists) {
          await Notification.create({
            createdBy: t.createdBy,
            title: "Task Overdue ⏰",
            description: description,
            category: "task",
            priority: "high",
            read: false
          });
        }
      }
    }

    // 2. Fetch all DB notifications
    const dbNotifications = await Notification.find(filter).sort({ createdAt: -1 });
    res.json(dbNotifications);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// PUT mark all as read
router.put("/mark-all-read", async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { createdBy: req.user.id };
    await Notification.updateMany({ ...filter, read: false }, { read: true });
    
    // notify socket
    try { req.app.get("io").emit("dashboardUpdated"); } catch (e) {}
    
    res.json({ message: "All marked as read" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to update notifications" });
  }
});

// PUT toggle or set read state for single notification
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { read } = req.body;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    if (req.user.role !== "admin" && String(notification.createdBy) !== req.user.id) {
      return res.status(403).json({ error: "Access denied ❌" });
    }

    notification.read = read;
    await notification.save();

    try { req.app.get("io").emit("dashboardUpdated"); } catch (e) {}

    res.json(notification);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

// DELETE clear all DB notifications
router.delete("/clear-all", async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { createdBy: req.user.id };
    await Notification.deleteMany(filter);
    
    try { req.app.get("io").emit("dashboardUpdated"); } catch (e) {}

    res.json({ message: "All DB notifications cleared" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to clear notifications" });
  }
});

// DELETE single notification
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    if (req.user.role !== "admin" && String(notification.createdBy) !== req.user.id) {
      return res.status(403).json({ error: "Access denied ❌" });
    }

    await Notification.findByIdAndDelete(id);
    
    try { req.app.get("io").emit("dashboardUpdated"); } catch (e) {}

    res.json({ message: "Notification deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

module.exports = router;
