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

  // 🔥 ADD THIS
  status: {
    type: String,
    default: "todo",
  },
});

module.exports = mongoose.model("Task", TaskSchema);