const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");
const Deal = require("../models/Deal");
const authMiddleware = require("../middleware/auth");

router.use(authMiddleware);

// GET ALL LEADS
router.get("/", async (req, res) => {
  try {
    const leads = await Lead.find().sort({ _id: -1 });
    res.json(leads);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed ❌" });
  }
});

// GET SINGLE LEAD
router.get("/:id", async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        error: "Lead not found ❌",
      });
    }

    const deal = await Deal.findOne({ leadId: lead._id });
    const leadObj = lead.toObject();
    if (deal) {
      leadObj.dealId = deal._id;
      leadObj.dealTitle = deal.title;
    }

    res.json(leadObj);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Failed ❌",
    });
  }
});

// POST CREATE LEAD
router.post("/", async (req, res) => {
  try {
    console.log("BODY:", req.body);
    const leadData = {
      ...req.body,
      activity: [
        {
          action: "Created",
          timestamp: new Date()
        }
      ]
    };
    const lead = await Lead.create(leadData);

    console.log("SAVED:", lead);

    // notify sockets
    try { req.app.get("io").emit("dashboardUpdated"); } catch (e) {}

    res.json(lead);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Save failed ❌" });
  }
});

// DELETE LEAD
router.delete("/:id", async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    try { req.app.get("io").emit("dashboardUpdated"); } catch (e) {}
    res.json({ message: "Deleted ✅" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Delete failed ❌" });
  }
});

// UPDATE LEAD (Tracks edits and status changes)
router.put("/:id", async (req, res) => {
  try {
    console.log("UPDATE BODY =>", req.body);
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: "Lead not found ❌" });
    }

    let isStatusChanged = false;
    let isEdited = false;

    if (req.body.status && req.body.status !== lead.status) {
      isStatusChanged = true;
    }

    const checkFields = ["name", "company", "phone", "city", "email", "source", "priority", "score", "temperature"];
    for (const field of checkFields) {
      if (req.body[field] !== undefined && req.body[field] !== lead[field]) {
        isEdited = true;
      }
    }

    // Update fields
    const directFields = [
      "name", "company", "phone", "city", "email", "source", "status", "priority", "score", "temperature"
    ];
    directFields.forEach(field => {
      if (req.body[field] !== undefined) {
        lead[field] = req.body[field];
      }
    });

    if (isStatusChanged) {
      lead.activity.push({ action: "Status Changed", timestamp: new Date() });
    } else if (isEdited) {
      lead.activity.push({ action: "Edited", timestamp: new Date() });
    }

    await lead.save();

    console.log("UPDATED =>", lead);

    try { req.app.get("io").emit("dashboardUpdated"); } catch (e) {}
    
    // Perform linked deal check to return same shape as GET /:id
    const deal = await Deal.findOne({ leadId: lead._id });
    const leadObj = lead.toObject();
    if (deal) {
      leadObj.dealId = deal._id;
      leadObj.dealTitle = deal.title;
    }

    res.json(leadObj);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Update failed",
    });
  }
});

// ADD NOTE TO LEAD
router.post("/:id/notes", async (req, res) => {
  try {
    const { text } = req.body;
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    
    lead.notesList.push({ text, date: new Date() });
    await lead.save();

    try { req.app.get("io").emit("dashboardUpdated"); } catch (e) {}
    res.json(lead);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to add note" });
  }
});

// ADD FOLLOW-UP
router.post("/:id/followups", async (req, res) => {
  try {
    const { text, method } = req.body;
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: "Lead not found" });

    lead.followups.push({ text, method, date: new Date() });
    await lead.save();

    try { req.app.get("io").emit("dashboardUpdated"); } catch (e) {}
    res.json(lead);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to add followup" });
  }
});

// ADD UPCOMING TASK
router.post("/:id/tasks", async (req, res) => {
  try {
    const { text, due } = req.body;
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: "Lead not found" });

    lead.upcomingTasks.push({ text, due, done: false });
    await lead.save();

    try { req.app.get("io").emit("dashboardUpdated"); } catch (e) {}
    res.json(lead);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to add task" });
  }
});

// TOGGLE UPCOMING TASK
router.put("/:id/tasks/:taskId", async (req, res) => {
  try {
    const { done } = req.body;
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: "Lead not found" });

    const task = lead.upcomingTasks.id(req.params.taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    task.done = done;
    await lead.save();

    try { req.app.get("io").emit("dashboardUpdated"); } catch (e) {}
    res.json(lead);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to update task" });
  }
});

module.exports = router;