const express = require("express");
const router = express.Router();

const Lead = require("../models/Lead");
const Deal = require("../models/Deal");
const Task = require("../models/Task");
const Contact = require("../models/Contact");

function maskLabel(name, fallback = "Record") {
  if (!name || typeof name !== "string") return `Anonymous ${fallback}`;
  const trimmed = name.trim();
  if (trimmed.length <= 1) return `${fallback} •••`;
  return `${trimmed[0]}${"•".repeat(Math.min(trimmed.length - 1, 6))}`;
}

function sanitizeLead(lead) {
  return {
    id: lead._id,
    label: maskLabel(lead.name, "Lead"),
    status: lead.status || "new",
    createdAt: lead.createdAt,
  };
}

function sanitizeDeal(deal) {
  return {
    id: deal._id,
    label: maskLabel(deal.title, "Deal"),
    stage: deal.stage || "new",
    createdAt: deal.createdAt,
  };
}

function sanitizeTask(task) {
  return {
    id: task._id,
    label: maskLabel(task.text, "Task"),
    status: task.done || task.status === "done" ? "done" : task.status || "todo",
    due: task.due,
    createdAt: task.createdAt,
  };
}

function sanitizeContact(contact) {
  return {
    id: contact._id,
    label: maskLabel(contact.name, "Contact"),
    role: contact.role || "contact",
    createdAt: contact.createdAt,
  };
}

router.get("/stats", async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const totalDeals = await Deal.countDocuments();
    const totalContacts = await Contact.countDocuments();
    const totalTasks = await Task.countDocuments();

    const completedTasks = await Task.countDocuments({ $or: [{ done: true }, { status: "done" }] });
    const pendingTasks = await Task.countDocuments({ status: { $in: ["todo", "progress"] } });

    const deals = await Deal.find();
    const wonDeals = deals.filter((d) => d.stage === "won").length;
    const activeDeals = deals.filter((d) => d.stage !== "won" && d.stage !== "lost").length;
    const revenue = deals.reduce((sum, d) => sum + Number(d.value || 0), 0);
    const conversionRate = totalLeads ? Number(((wonDeals / totalLeads) * 100).toFixed(1)) : 0;

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
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching public stats" });
  }
});

router.get("/activity", async (req, res) => {
  try {
    const [leads, deals, tasks, contacts] = await Promise.all([
      Lead.find().sort({ _id: -1 }).limit(5),
      Deal.find().sort({ createdAt: -1 }).limit(5),
      Task.find().sort({ _id: -1 }).limit(5),
      Contact.find().sort({ _id: -1 }).limit(5),
    ]);

    const today = new Date();
    const tasksDueToday = tasks.filter((t) => {
      if (!t.due) return false;
      const due = new Date(t.due);
      return (
        due.getFullYear() === today.getFullYear() &&
        due.getMonth() === today.getMonth() &&
        due.getDate() === today.getDate()
      );
    }).length;

    const contactsThisMonth = contacts.filter((c) => {
      const created = c.createdAt ? new Date(c.createdAt) : null;
      if (!created) return false;
      return created.getFullYear() === today.getFullYear() && created.getMonth() === today.getMonth();
    }).length;

    res.json({
      leads: leads.map(sanitizeLead),
      deals: deals.map(sanitizeDeal),
      tasks: tasks.map(sanitizeTask),
      contacts: contacts.map(sanitizeContact),
      tasksDueToday,
      contactsThisMonth,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching public activity" });
  }
});

module.exports = router;
