const express = require("express");
const router = express.Router();
const Deal = require("../models/Deal");
const Lead = require("../models/Lead");
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/auth");

router.use(authMiddleware);

router.get("/", async (req, res) => {
  const deals = await Deal.find().populate("leadId");
  res.json(deals);
});

router.post("/", async (req, res) => {
  try {
    const { leadId } = req.body;

    // ✅ duplicate check
    const existing = await Deal.findOne({
      leadId: new mongoose.Types.ObjectId(leadId),
    });
    if (existing) {
      return res.json({ message: "ALREADY_CONVERTED" });
    }

    // ✅ create deal with activity
    const dealData = {
      ...req.body,
      activity: [
        {
          action: "Deal Created",
          timestamp: new Date(),
        },
      ],
    };

    const deal = await Deal.create(dealData);

    // 🔥 Update lead status and activity
    await Lead.findByIdAndUpdate(leadId, {
      status: "converted",
      $push: {
        activity: {
          action: "Converted to Deal",
          timestamp: new Date()
        }
      }
    });

    try { req.app.get("io").emit("dashboardUpdated"); } catch (e) {}

    res.json(deal);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error creating deal" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { stage, notes, title, company, value, contact } = req.body;
    const dealId = req.params.id;

    // Get current deal to track changes
    const currentDeal = await Deal.findById(dealId);
    const activity = [...(currentDeal?.activity || [])];

    // Track stage changes
    if (stage && stage !== currentDeal?.stage) {
      activity.push({
        action: `Moved to ${stage.charAt(0).toUpperCase() + stage.slice(1)}`,
        timestamp: new Date(),
      });
    }

    // Track notes updates
    if (notes !== undefined && notes !== currentDeal?.notes) {
      activity.push({
        action: "Updated Notes",
        timestamp: new Date(),
      });
    }

    const updated = await Deal.findByIdAndUpdate(
      dealId,
      { stage, notes, title, company, value, contact, activity },
      { new: true }
    );

    try { req.app.get("io").emit("dashboardUpdated"); } catch (e) {}

    res.json(updated);
  } catch (err) {
    console.log("UPDATE ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Deal.findByIdAndDelete(req.params.id);
    try { req.app.get("io").emit("dashboardUpdated"); } catch (e) {}
    res.json({ message: "Deal deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error deleting deal" });
  }
});

module.exports = router;