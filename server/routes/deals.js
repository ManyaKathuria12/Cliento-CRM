const express = require("express");
const router = express.Router();
const Deal = require("../models/Deal");
const Lead = require("../models/Lead");
const Activity = require("../models/Activity");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/auth");
const { notify } = require("../utils/notifier");

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
    const leadObj = await Lead.findByIdAndUpdate(leadId, {
      status: "converted",
      $push: {
        activity: {
          action: "Converted to Deal",
          timestamp: new Date()
        }
      }
    }, { new: true });

    // Log Activity & Notification
    try {
      await Activity.create({
        action: "Lead Converted",
        meta: leadObj ? leadObj.name : "Unknown Lead",
        type: "lead"
      });

      await Activity.create({
        action: "Deal Created",
        meta: deal.title || "Untitled Deal",
        type: "deal"
      });

      await notify(req.app, "Lead Converted 🔄", `Lead "${leadObj ? leadObj.name : "Unknown"}" was converted.`, "lead", "medium");
      await notify(req.app, "Deal Created 💼", `Deal "${deal.title}" was created.`, "deal", "medium");
    } catch (err) {
      console.log("Error logging deal conversion activities:", err);
    }

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

    let isWon = false;
    let isLost = false;
    // Track stage changes
    if (stage && stage !== currentDeal?.stage) {
      activity.push({
        action: `Moved to ${stage.charAt(0).toUpperCase() + stage.slice(1)}`,
        timestamp: new Date(),
      });
      if (stage.toLowerCase() === "won") {
        isWon = true;
      } else if (stage.toLowerCase() === "lost") {
        isLost = true;
      }
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

    // Log Activity & Notification on Deal Won
    if (isWon && updated) {
      try {
        await Activity.create({
          action: "Deal Won 🎉",
          meta: `${updated.title} (Value: ₹${Number(updated.value || 0).toLocaleString("en-IN")})`,
          type: "deal"
        });

        await notify(req.app, "Deal Won 🎉", `Deal "${updated.title}" moved to Won.`, "deal", "high");
      } catch (err) {
        console.log("Error logging won deal activities:", err);
      }
    }

    // Log Activity & Notification on Deal Lost
    if (isLost && updated) {
      try {
        await Activity.create({
          action: "Deal Lost ❌",
          meta: `${updated.title}`,
          type: "deal"
        });

        await notify(req.app, "Deal Lost ❌", `Deal "${updated.title}" moved to Lost.`, "deal", "high");
      } catch (err) {
        console.log("Error logging lost deal activities:", err);
      }
    }

    try { req.app.get("io").emit("dashboardUpdated"); } catch (e) {}

    res.json(updated);
  } catch (err) {
    console.log("UPDATE ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (deal) {
      await Deal.findByIdAndDelete(req.params.id);
      try { req.app.get("io").emit("dashboardUpdated"); } catch (e) {}
      await notify(req.app, "Deal Deleted 🗑️", `Deal "${deal.title}" was deleted.`, "deal", "low");
    }
    res.json({ message: "Deal deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error deleting deal" });
  }
});

module.exports = router;