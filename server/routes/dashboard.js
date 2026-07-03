const express = require("express");
const router = express.Router();

const Lead = require("../models/Lead");
const Deal = require("../models/Deal");
const Task = require("../models/Task");
const User = require("../models/User");
const Contact = require("../models/Contact");
const Activity = require("../models/Activity");
const authMiddleware = require("../middleware/auth");

router.use(authMiddleware);

router.get("/stats", async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const totalDeals = await Deal.countDocuments();
    const totalContacts = await Contact.countDocuments();
    const totalTasks = await Task.countDocuments();

    const completedTasks = await Task.countDocuments({ $or: [{ done: true }, { status: "done" }] });
    const pendingTasks = await Task.countDocuments({ status: { $in: ["todo", "progress"] } });

    const deals = await Deal.find();
    const wonDeals = deals.filter(d => d.stage === "won").length;
    const activeDeals = deals.filter(d => d.stage !== "won" && d.stage !== "lost").length;

    // Revenue: sum numeric values of all won deals
    const revenue = deals
      .filter(d => d.stage === "won")
      .reduce((sum, d) => sum + (parseFloat(String(d.value).replace(/[^0-9.]/g, "")) || 0), 0);

    const convertedLeadsCount = await Lead.countDocuments({ status: "converted" });
    const conversionRate = totalLeads ? Number(((convertedLeadsCount / totalLeads) * 100).toFixed(1)) : 0;

    // --- MONTHLY COMPARISONS ---
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Helpers
    const parseValue = (v) => parseFloat(String(v || 0).replace(/[^0-9.]/g, "")) || 0;
    const calculateChange = (curr, prev) => {
      if (prev === 0) return curr > 0 ? "100.0%" : "0.0%";
      const percent = ((curr - prev) / prev) * 100;
      return `${Math.abs(percent).toFixed(1)}%`;
    };

    // 1. Leads
    const currentLeadsCount = await Lead.countDocuments({ createdAt: { $gte: startOfCurrentMonth } });
    const previousLeadsCount = await Lead.countDocuments({ createdAt: { $gte: startOfPreviousMonth, $lt: startOfCurrentMonth } });
    const leadsChange = calculateChange(currentLeadsCount, previousLeadsCount);
    const leadsChangeType = currentLeadsCount >= previousLeadsCount ? "up" : "down";

    // 2. Revenue
    const currentWonDeals = deals.filter(d => d.stage === "won" && new Date(d.createdAt) >= startOfCurrentMonth);
    const previousWonDeals = deals.filter(d => d.stage === "won" && new Date(d.createdAt) >= startOfPreviousMonth && new Date(d.createdAt) < startOfCurrentMonth);
    const currentRevenue = currentWonDeals.reduce((sum, d) => sum + parseValue(d.value), 0);
    const previousRevenue = previousWonDeals.reduce((sum, d) => sum + parseValue(d.value), 0);
    const revenueChange = calculateChange(currentRevenue, previousRevenue);
    const revenueChangeType = currentRevenue >= previousRevenue ? "up" : "down";

    // 3. Conversion Rate
    const currentTotalLeads = await Lead.countDocuments({ createdAt: { $gte: startOfCurrentMonth } });
    const currentConvertedLeads = await Lead.countDocuments({ status: "converted", createdAt: { $gte: startOfCurrentMonth } });
    const currentConvRate = currentTotalLeads ? (currentConvertedLeads / currentTotalLeads) * 100 : 0;

    const previousTotalLeads = await Lead.countDocuments({ createdAt: { $gte: startOfPreviousMonth, $lt: startOfCurrentMonth } });
    const previousConvertedLeads = await Lead.countDocuments({ status: "converted", createdAt: { $gte: startOfPreviousMonth, $lt: startOfCurrentMonth } });
    const previousConvRate = previousTotalLeads ? (previousConvertedLeads / previousTotalLeads) * 100 : 0;

    const convRateChange = calculateChange(currentConvRate, previousConvRate);
    const convRateChangeType = currentConvRate >= previousConvRate ? "up" : "down";

    // 4. Active Deals
    const currentActiveDeals = deals.filter(d => d.stage !== "won" && d.stage !== "lost" && new Date(d.createdAt) >= startOfCurrentMonth).length;
    const previousActiveDeals = deals.filter(d => d.stage !== "won" && d.stage !== "lost" && new Date(d.createdAt) >= startOfPreviousMonth && new Date(d.createdAt) < startOfCurrentMonth).length;
    const activeDealsChange = calculateChange(currentActiveDeals, previousActiveDeals);
    const activeDealsChangeType = currentActiveDeals >= previousActiveDeals ? "up" : "down";

    // 5. Won Deals
    const currentWonDealsCount = currentWonDeals.length;
    const previousWonDealsCount = previousWonDeals.length;
    const wonDealsChange = calculateChange(currentWonDealsCount, previousWonDealsCount);
    const wonDealsChangeType = currentWonDealsCount >= previousWonDealsCount ? "up" : "down";

    // 6. Contacts
    const currentContacts = await Contact.countDocuments({ createdAt: { $gte: startOfCurrentMonth } });
    const previousContacts = await Contact.countDocuments({ createdAt: { $gte: startOfPreviousMonth, $lt: startOfCurrentMonth } });
    const contactsChange = calculateChange(currentContacts, previousContacts);
    const contactsChangeType = currentContacts >= previousContacts ? "up" : "down";

    // --- CHARTS & DISTRIBUTION ---
    // Revenue trend by month
    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => ({ _id: i + 1, total: 0 }));
    deals.filter(d => d.stage === "won").forEach(d => {
      const month = new Date(d.createdAt).getMonth() + 1;
      const val = parseValue(d.value);
      const item = monthlyRevenue.find(m => m._id === month);
      if (item) item.total += val;
    });

    // Lead growth by month
    const leadsList = await Lead.find();
    const monthlyLeads = Array.from({ length: 12 }, (_, i) => ({ _id: i + 1, total: 0 }));
    leadsList.forEach(l => {
      const month = new Date(l.createdAt).getMonth() + 1;
      const item = monthlyLeads.find(m => m._id === month);
      if (item) item.total += 1;
    });

    // Lead source distribution
    const sourceMap = {};
    leadsList.forEach(l => {
      const src = l.source || "Unknown";
      sourceMap[src] = (sourceMap[src] || 0) + 1;
    });
    const leadSourceDistribution = Object.entries(sourceMap).map(([name, value]) => ({ name, value }));

    // Deal stage distribution
    const stageMap = {};
    deals.forEach(d => {
      const stage = d.stage || "new";
      stageMap[stage] = (stageMap[stage] || 0) + 1;
    });
    const dealStatusDistribution = Object.entries(stageMap).map(([name, value]) => ({ name, value }));

    // --- RECENT ACTIVITIES ---
    const activities = await Activity.find().sort({ timestamp: -1 }).limit(10);

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
      leadSourceDistribution,
      dealStatusDistribution,
      activities,
      // Change fields
      leadsChange,
      leadsChangeType,
      revenueChange,
      revenueChangeType,
      conversionRateChange: convRateChange,
      conversionRateChangeType: convRateChangeType,
      activeDealsChange,
      activeDealsChangeType,
      wonDealsChange,
      wonDealsChangeType,
      contactsChange,
      contactsChangeType,
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