const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
  },
  meta: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    enum: ["lead", "deal", "task", "contact", "system"],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model("Activity", activitySchema);
