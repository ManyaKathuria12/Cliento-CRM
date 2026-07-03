const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const authMiddleware = require("../middleware/auth");
const { notify } = require("../utils/notifier");

router.use(authMiddleware);

// 🔥 CHECK MODEL
console.log("MODEL:", Contact);

// GET stats
router.get("/stats", async (req, res) => {
  try {
    const totalContacts = await Contact.countDocuments();
    const companiesList = await Contact.distinct("company");
    const companiesCount = companiesList.filter(Boolean).length;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentContacts = await Contact.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    const activeCompanies = await Deal.find({ stage: { $nin: ["won", "lost"] } }).distinct("company");
    const activeContacts = await Contact.countDocuments({ company: { $in: activeCompanies } });

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
    const currentContacts = await Contact.countDocuments({ createdAt: { $gte: startOfCurrentMonth } });
    const previousContacts = await Contact.countDocuments({ createdAt: { $gte: startOfPreviousMonth, $lt: startOfCurrentMonth } });
    const contactsDiff = getDiff(currentContacts, previousContacts);

    // 2. Companies Count comparison
    const currentCompaniesList = await Contact.distinct("company", { createdAt: { $gte: startOfCurrentMonth } });
    const currentCompanies = currentCompaniesList.filter(Boolean).length;
    const previousCompaniesList = await Contact.distinct("company", { createdAt: { $gte: startOfPreviousMonth, $lt: startOfCurrentMonth } });
    const previousCompanies = previousCompaniesList.filter(Boolean).length;
    const companiesDiff = getDiff(currentCompanies, previousCompanies);

    // 3. Recent Contacts comparison (sliding 30 days vs 30-60 days)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const previousRecentContacts = await Contact.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } });
    const recentDiff = getDiff(recentContacts, previousRecentContacts);

    // 4. Active Contacts comparison
    const currentActiveContacts = await Contact.countDocuments({ company: { $in: activeCompanies }, createdAt: { $gte: startOfCurrentMonth } });
    const previousActiveContacts = await Contact.countDocuments({ company: { $in: activeCompanies }, createdAt: { $gte: startOfPreviousMonth, $lt: startOfCurrentMonth } });
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
    const contacts = await Contact.find().sort({ _id: -1 });
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

    const contact = await Contact.create(req.body);

    console.log("SAVED:", contact);

    try { req.app.get("io").emit("dashboardUpdated"); } catch (e) {}

    await notify(req.app, "Contact Created 👥", `Contact "${contact.name}" representing "${contact.company || 'Individual'}" was created.`, "contact", "medium");

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
      await Contact.findByIdAndDelete(req.params.id);
      try { req.app.get("io").emit("dashboardUpdated"); } catch (e) {}
      await notify(req.app, "Contact Deleted 🗑️", `Contact "${contact.name}" was deleted.`, "contact", "low");
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
    const updated = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    try { req.app.get("io").emit("dashboardUpdated"); } catch (e) {}
    
    if (updated) {
      await notify(req.app, "Contact Updated 👥", `Contact "${updated.name}" details were updated.`, "contact", "low");
    }

    res.json(updated);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Update failed ❌" });
  }
});

module.exports = router;