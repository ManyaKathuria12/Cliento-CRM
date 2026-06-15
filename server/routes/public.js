const express = require("express");
const router = express.Router();

const Lead = require("../models/Lead");
const Deal = require("../models/Deal");
const Task = require("../models/Task");
const Contact = require("../models/Contact");

function idToDate(id) {
  try {
    return new Date(parseInt(id.toString().substring(0, 8), 16) * 1000);
  } catch {
    return null;
  }
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function parseDueDate(due) {
  if (!due) return null;
  const parsed = new Date(due);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function maskLabel(name, fallback = "Record") {
  if (!name || typeof name !== "string") return `Anonymous ${fallback}`;
  const trimmed = name.trim();
  if (trimmed.length <= 1) return `${fallback} •••`;
  return `${trimmed[0]}${"•".repeat(Math.min(trimmed.length - 1, 6))}`;
}

function sanitizeLead(lead) {
  return {
    id: String(lead._id),
    label: maskLabel(lead.name, "Lead"),
    status: lead.status || "new",
    createdAt: lead.createdAt || idToDate(lead._id),
  };
}

function sanitizeDeal(deal) {
  return {
    id: String(deal._id),
    label: maskLabel(deal.title, "Deal"),
    stage: deal.stage || "new",
    createdAt: deal.createdAt || idToDate(deal._id),
  };
}

function sanitizeTask(task) {
  return {
    id: String(task._id),
    label: maskLabel(task.text, "Task"),
    status: task.done || task.status === "done" ? "done" : task.status || "todo",
    due: task.due,
    createdAt: task.createdAt || idToDate(task._id),
  };
}

function sanitizeContact(contact) {
  return {
    id: String(contact._id),
    label: maskLabel(contact.name, "Contact"),
    role: contact.role || "contact",
    createdAt: idToDate(contact._id),
  };
}

router.get("/overview", async (req, res) => {
  try {
    const [totalLeads, deals, allTasks, allContacts] = await Promise.all([
      Lead.countDocuments(),
      Deal.find().lean(),
      Task.find().lean(),
      Contact.find().lean(),
    ]);

    const today = new Date();
    const wonDeals = deals.filter((d) => (d.stage || "").toLowerCase() === "won").length;
    const activeDeals = deals.filter((d) => {
      const stage = (d.stage || "").toLowerCase();
      return stage !== "won" && stage !== "lost";
    }).length;

    const totalRevenue = deals.reduce((sum, d) => {
      const raw = String(d.value || "0").replace(/[^\d.]/g, "");
      return sum + (Number(raw) || 0);
    }, 0);

    const conversionRate = totalLeads
      ? Number(((wonDeals / totalLeads) * 100).toFixed(1))
      : 0;

    const tasksDueToday = allTasks.filter((t) => {
      const due = parseDueDate(t.due);
      return due ? isSameDay(due, today) : false;
    }).length;

    const newContacts = allContacts.filter((c) => {
      const created = c.createdAt ? new Date(c.createdAt) : idToDate(c._id);
      return created ? isSameMonth(created, today) : false;
    }).length;

    res.json({
      totalLeads,
      activeDeals,
      totalRevenue,
      conversionRate,
      tasksDueToday,
      newContacts,
    });
  } catch (err) {
    console.error("Public overview error:", err);
    res.status(500).json({ message: "Error fetching public overview" });
  }
});

router.get("/activity", async (req, res) => {
  try {
    const [leads, deals, tasks, contacts] = await Promise.all([
      Lead.find().sort({ createdAt: -1, _id: -1 }).limit(5).lean(),
      Deal.find().sort({ createdAt: -1, _id: -1 }).limit(5).lean(),
      Task.find().sort({ _id: -1 }).limit(5).lean(),
      Contact.find().sort({ _id: -1 }).limit(5).lean(),
    ]);

    res.json({
      leads: leads.map(sanitizeLead),
      deals: deals.map(sanitizeDeal),
      tasks: tasks.map(sanitizeTask),
      contacts: contacts.map(sanitizeContact),
    });
  } catch (err) {
    console.error("Public activity error:", err);
    res.status(500).json({ message: "Error fetching public activity" });
  }
});

module.exports = router;
