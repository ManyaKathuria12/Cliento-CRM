const express = require("express");
const router = express.Router();

const Lead = require("../models/Lead");
const Deal = require("../models/Deal");
const Task = require("../models/Task");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

router.use(authMiddleware);

router.get("/stats", async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const totalDeals = await Deal.countDocuments();
    const totalContacts = await require("../models/Contact").countDocuments();
    const totalTasks = await Task.countDocuments();

    const completedTasks = await Task.countDocuments({ $or: [{ done: true }, { status: "done" }] });
    const pendingTasks = await Task.countDocuments({ status: { $in: ["todo", "progress"] } });

    const deals = await Deal.find();
    const wonDeals = deals.filter(d => d.stage === "won").length;
    const activeDeals = deals.filter(d => d.stage !== "won").length;

    // revenue (sum numeric values)
    const revenue = deals.reduce((sum, d) => sum + Number(d.value || 0), 0);

    const conversionRate = totalLeads ? Number(((wonDeals / totalLeads) * 100).toFixed(1)) : 0;

    // monthly aggregates (optional)
    const monthlyRevenue = await Deal.aggregate([
      { $group: { _id: { $month: "$createdAt" }, total: { $sum: { $toDouble: "$value" } } } },
      { $sort: { _id: 1 } }
    ]);

    const monthlyLeads = await Lead.aggregate([
      { $group: { _id: { $month: "$createdAt" }, total: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalLeads,
      totalDeals,
      totalContacts,
      totalTasks,
      completedTasks,
      pendingTasks,
      wonDeals,
      activeDeals,
      revenue,
      conversionRate,
      monthlyRevenue,
      monthlyLeads,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching stats" });
  }
});

router.get("/", async (req, res) => {
  try {
    const users = await User.countDocuments();
    const tasks = await Task.countDocuments();
   const pending = await Task.countDocuments({
  status: { $in: ["todo", "progress"] }
});

    res.json({ users, tasks, pending });
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats" });
  }
});

router.get("/tasks-preview", async (req, res) => {
  try {
    const tasks = await Task.find()
      .sort({ createdAt: -1 })
      .limit(4);

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

module.exports = router;