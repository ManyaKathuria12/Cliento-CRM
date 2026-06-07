const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");

// 🔥 CHECK MODEL
console.log("MODEL:", Contact);

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

    res.json(contact);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Add failed ❌" });
  }
});

// ✅ DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
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
    res.json(updated);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Update failed ❌" });
  }
});

module.exports = router;