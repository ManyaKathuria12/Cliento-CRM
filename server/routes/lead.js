const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");


console.log("MODEL:", Lead); // 🔥 debug
// GET
router.get("/", async (req, res) => {
  try {
    const leads = await Lead.find().sort({ _id: -1 });
    res.json(leads);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed ❌" });
  }
});

// GET SINGLE LEAD
router.get("/:id", async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        error: "Lead not found ❌",
      });
    }

    res.json(lead);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Failed ❌",
    });
  }
});

// POST
router.post("/", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const lead = await Lead.create(req.body);

    console.log("SAVED:", lead);

    res.json(lead);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Save failed ❌" });
  }
});

// DELETE
// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted ✅" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Delete failed ❌" });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    console.log("UPDATE BODY =>", req.body);

    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    console.log("UPDATED =>", updated);

    res.json(updated);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Update failed",
    });
  }
});
module.exports = router;