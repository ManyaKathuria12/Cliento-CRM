const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const Deal = require("../models/Deal");
const authMiddleware = require("../middleware/auth");
const { notify } = require("../utils/notifier");

router.use(authMiddleware);

// 🔥 CHECK MODEL
console.log("MODEL:", Contact);

// GET stats
router.get("/stats", async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { createdBy: req.user.id };

    const totalContacts = await Contact.countDocuments(filter);
    const companiesList = await Contact.distinct("company", filter);
    const companiesCount = companiesList.filter(Boolean).length;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentContacts = await Contact.countDocuments({ ...filter, createdAt: { $gte: thirtyDaysAgo } });

    const dealFilter = req.user.role === "admin" ? {} : { createdBy: req.user.id };
    const activeCompanies = await Deal.find({ ...dealFilter, stage: { $nin: ["won", "lost"] } }).distinct("company");
    const activeContacts = await Contact.countDocuments({ ...filter, company: { $in: activeCompanies } });

    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const calculateChange = (curr, prev) => {
      if (prev === 0) return curr > 0 ? "100.0%" : "0.0%";
      const percent = ((curr - prev) / prev) * 100;
      return `${Math.abs(percent).toFixed(1)}%`;
    };

    const getDiff = (curr, prev) => {
      const changeVal = calculateChange(curr, prev);
      const changeTypeVal = curr >= prev ? "up" : "down";
      return { change: changeVal, changeType: changeTypeVal };
    };

    // 1. Total Contacts comparison
    const currentContacts = await Contact.countDocuments({ ...filter, createdAt: { $gte: startOfCurrentMonth } });
    const previousContacts = await Contact.countDocuments({ ...filter, createdAt: { $gte: startOfPreviousMonth, $lt: startOfCurrentMonth } });
    const contactsDiff = getDiff(currentContacts, previousContacts);

    // 2. Companies Count comparison
    const currentCompaniesList = await Contact.distinct("company", { ...filter, createdAt: { $gte: startOfCurrentMonth } });
    const currentCompanies = currentCompaniesList.filter(Boolean).length;
    const previousCompaniesList = await Contact.distinct("company", { ...filter, createdAt: { $gte: startOfPreviousMonth, $lt: startOfCurrentMonth } });
    const previousCompanies = previousCompaniesList.filter(Boolean).length;
    const companiesDiff = getDiff(currentCompanies, previousCompanies);

    // 3. Recent Contacts comparison (sliding 30 days vs 30-60 days)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const previousRecentContacts = await Contact.countDocuments({ ...filter, createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } });
    const recentDiff = getDiff(recentContacts, previousRecentContacts);

    // 4. Active Contacts comparison
    const currentActiveContacts = await Contact.countDocuments({ ...filter, company: { $in: activeCompanies }, createdAt: { $gte: startOfCurrentMonth } });
    const previousActiveContacts = await Contact.countDocuments({ ...filter, company: { $in: activeCompanies }, createdAt: { $gte: startOfPreviousMonth, $lt: startOfCurrentMonth } });
    const activeDiff = getDiff(currentActiveContacts, previousActiveContacts);

    res.json({
      totalContacts,
      companiesCount,
      recentContacts,
      activeContacts,
      contactsChange: contactsDiff.change,
      contactsChangeType: contactsDiff.changeType,
      companiesChange: companiesDiff.change,
      companiesChangeType: companiesDiff.changeType,
      recentContactsChange: recentDiff.change,
      recentContactsChangeType: recentDiff.changeType,
      activeContactsChange: activeDiff.change,
      activeContactsChangeType: activeDiff.changeType
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Fetch stats failed ❌" });
  }
});

// ✅ GET ALL
router.get("/", async (req, res) => {
  try {
    const query = req.user.role === "admin" ? {} : { createdBy: req.user.id };
    const contacts = await Contact.find(query).sort({ _id: -1 });
    res.json(contacts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Fetch failed ❌" });
  }
});

// ✅ ADD
router.post("/", async (req, res) => {
  try {
    console.log("BODY:", req.body);
    const contactData = {
      ...req.body,
      createdBy: req.user.id
    };

    const contact = await Contact.create(contactData);

    console.log("SAVED:", contact);

    try { req.app.get("io").emit("dashboardUpdated"); } catch (e) {}

    await notify(req.app, "Contact Created 👥", `Contact "${contact.name}" representing "${contact.company || 'Individual'}" was created.`, "contact", "medium", req.user.id);

    res.json(contact);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Add failed ❌" });
  }
});

// ✅ DELETE
router.delete("/:id", async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (contact) {
      if (req.user.role !== "admin" && String(contact.createdBy) !== req.user.id) {
        return res.status(403).json({ error: "Access denied ❌" });
      }
      await Contact.findByIdAndDelete(req.params.id);
      try { req.app.get("io").emit("dashboardUpdated"); } catch (e) {}
      await notify(req.app, "Contact Deleted 🗑️", `Contact "${contact.name}" was deleted.`, "contact", "low", req.user.id);
    }
    res.json({ message: "Deleted ✅" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Delete failed ❌" });
  }
});

// ✅ UPDATE
router.put("/:id", async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: "Contact not found ❌" });
    }

    if (req.user.role !== "admin" && String(contact.createdBy) !== req.user.id) {
      return res.status(403).json({ error: "Access denied ❌" });
    }

    const updated = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    try { req.app.get("io").emit("dashboardUpdated"); } catch (e) {}
    
    if (updated) {
      await notify(req.app, "Contact Updated 👥", `Contact "${updated.name}" details were updated.`, "contact", "low", req.user.id);
    }

    res.json(updated);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Update failed ❌" });
  }
});

module.exports = router;