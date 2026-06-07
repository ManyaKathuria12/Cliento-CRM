const express = require("express");
const router = express.Router();

const Lead = require("../models/Lead");
const Deal = require("../models/Deal");
const Task = require("../models/Task");
const User = require("../models/User");


router.get("/stats", async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const deals = await Deal.find();

    // 💰 revenue
    const revenue = deals.reduce(
      (sum, d) => sum + Number(d.value || 0),
      0
    );

    // 📦 active deals
    const activeDeals = deals.filter(d => d.stage !== "won").length;

    // 📊 conversion rate
    const wonDeals = deals.filter(d => d.stage === "won").length;
    const conversionRate = totalLeads
      ? ((wonDeals / totalLeads) * 100).toFixed(1)
      : 0;

    // 📈 MONTHLY REVENUE
    const monthlyRevenue = await Deal.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: { $toDouble: "$value" } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 📊 MONTHLY LEADS
    const monthlyLeads = await Lead.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 🔥 FINAL RESPONSE
    res.json({
      totalLeads,
      revenue,
      conversionRate,
      activeDeals,
      monthlyRevenue, // 🔥 ADD
      monthlyLeads,   // 🔥 ADD
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