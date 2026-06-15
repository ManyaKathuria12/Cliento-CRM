const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const authMiddleware = require("../middleware/auth");

router.use(authMiddleware);

// GET all tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("relatedLead")
      .populate("relatedDeal")
      .sort({ _id: -1 });
    res.json(tasks);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// GET single task
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("relatedLead")
      .populate("relatedDeal");
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(task);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch task" });
  }
});

// CREATE new task
router.post("/", async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      activity: [
        {
          action: "Task Created",
          timestamp: new Date(),
        }
      ]
    };
    const task = await Task.create(taskData);

    req.app.get("io").emit("tasksUpdated");
    try { req.app.get("io").emit("dashboardUpdated"); } catch (e) {}

    res.json(task);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// UPDATE task
router.put("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const oldDone = task.done;
    const oldStatus = task.status;
    const oldDue = task.due;

    let isEdited = false;
    let isStatusChanged = false;
    let isRescheduled = false;
    let isCompleted = false;

    // Check if reschedule occurred
    if (req.body.due !== undefined && req.body.due !== oldDue) {
      isRescheduled = true;
    }

    // Check if status changed
    if (req.body.status !== undefined && req.body.status !== oldStatus) {
      isStatusChanged = true;
    }

    // Check if completed
    if (req.body.done !== undefined && req.body.done !== oldDone) {
      if (req.body.done) {
        isCompleted = true;
      }
    }

    // Check if other text/assignee/priority/description changed
    const checkFields = [
      "text", "assignee", "priority", "description", "reminderDate",
      "reminderTime", "relatedLead", "relatedDeal"
    ];
    for (const f of checkFields) {
      if (req.body[f] !== undefined && req.body[f] !== task[f]) {
        isEdited = true;
      }
    }

    // Update fields
    const directFields = [
      "text", "assignee", "due", "priority", "done", "status", "description",
      "reminderDate", "reminderTime", "relatedLead", "relatedDeal"
    ];
    directFields.forEach((f) => {
      if (req.body[f] !== undefined) {
        task[f] = req.body[f];
      }
    });

    // Handle Completed details & activity log
    if (isCompleted) {
      task.completedBy = req.user ? req.user.name : "System User";
      task.completedAt = new Date();
      task.activity.push({ action: "Completed", timestamp: new Date() });
    } else if (isRescheduled) {
      task.activity.push({ action: "Rescheduled", timestamp: new Date() });
    } else if (isStatusChanged) {
      task.activity.push({ action: "Status Changed", timestamp: new Date() });
    } else if (isEdited) {
      task.activity.push({ action: "Task Edited", timestamp: new Date() });
    }

    await task.save();

    req.app.get("io").emit("tasksUpdated");
    try { req.app.get("io").emit("dashboardUpdated"); } catch (e) {}

    // Populate references before sending back
    const populatedTask = await Task.findById(task._id)
      .populate("relatedLead")
      .populate("relatedDeal");

    res.json(populatedTask);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Update failed ❌" });
  }
});

// ADD NOTE TO TASK
router.post("/:id/notes", async (req, res) => {
  try {
    const { text } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const author = req.user ? req.user.name : "System User";
    task.notes.push({ text, date: new Date(), author });
    await task.save();

    req.app.get("io").emit("tasksUpdated");
    try { req.app.get("io").emit("dashboardUpdated"); } catch (e) {}

    res.json(task);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to add note" });
  }
});

// ADD CHECKLIST ITEM
router.post("/:id/checklist", async (req, res) => {
  try {
    const { text } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    task.checklist.push({ text, done: false });
    await task.save();

    req.app.get("io").emit("tasksUpdated");
    try { req.app.get("io").emit("dashboardUpdated"); } catch (e) {}

    res.json(task);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to add checklist item" });
  }
});

// TOGGLE CHECKLIST ITEM
router.put("/:id/checklist/:itemId", async (req, res) => {
  try {
    const { done } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const item = task.checklist.id(req.params.itemId);
    if (!item) return res.status(404).json({ error: "Checklist item not found" });

    item.done = done;
    await task.save();

    req.app.get("io").emit("tasksUpdated");
    try { req.app.get("io").emit("dashboardUpdated"); } catch (e) {}

    res.json(task);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to update checklist item" });
  }
});

// DELETE task
router.delete("/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    
    req.app.get("io").emit("tasksUpdated");
    try { req.app.get("io").emit("dashboardUpdated"); } catch (e) {}

    res.json({ message: "Task deleted ✅" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Delete failed ❌" });
  }
});

module.exports = router;