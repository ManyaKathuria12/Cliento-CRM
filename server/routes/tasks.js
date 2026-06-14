const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const authMiddleware = require("../middleware/auth");

router.use(authMiddleware);

// 🔥 GET all tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ _id: -1 });
    res.json(tasks);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// 🔥 CREATE new task
router.post("/", async (req, res) => {
  try {
    const task = await Task.create(req.body);

    // ✅ ADD THIS
    req.app.get("io").emit("tasksUpdated");
    try { req.app.get("io").emit("dashboardUpdated"); } catch (e) {}

    res.json(task);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// 🔥 UPDATE task
router.put("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // 🔥 IMPORTANT FIX
    if (req.body.status !== undefined) {
      task.status = req.body.status;
    }

    if (req.body.done !== undefined) {
      task.done = req.body.done;
    }

    // optional fields
    if (req.body.text) task.text = req.body.text;
    if (req.body.assignee) task.assignee = req.body.assignee;
    if (req.body.due) task.due = req.body.due;
    if (req.body.priority) task.priority = req.body.priority;

    await task.save();

    req.app.get("io").emit("tasksUpdated");
    try { req.app.get("io").emit("dashboardUpdated"); } catch (e) {}

    res.json(task);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Update failed ❌" });
  }
});

// 🔥 DELETE task
router.delete("/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    // ✅ ADD THIS
    req.app.get("io").emit("tasksUpdated");
    try { req.app.get("io").emit("dashboardUpdated"); } catch (e) {}

    res.json({ message: "Task deleted ✅" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Delete failed ❌" });
  }
});

module.exports = router;