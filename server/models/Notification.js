const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["lead", "deal", "task", "contact", "system"],
    default: "system",
  },
  read: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
