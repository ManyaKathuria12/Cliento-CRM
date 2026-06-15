const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  text: String,
  assignee: String,
  due: String,
  priority: String,
  done: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    default: "todo",
  },
  description: {
    type: String,
    default: "",
  },
  relatedLead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lead",
  },
  relatedDeal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Deal",
  },
  notes: [{
    text: String,
    date: { type: Date, default: Date.now },
    author: String,
  }],
  checklist: [{
    text: String,
    done: { type: Boolean, default: false },
  }],
  activity: [{
    action: String,
    timestamp: { type: Date, default: Date.now },
  }],
  reminderDate: {
    type: String,
    default: "",
  },
  reminderTime: {
    type: String,
    default: "",
  },
  completedBy: {
    type: String,
    default: "",
  },
  completedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model("Task", TaskSchema);