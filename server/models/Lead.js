const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  name: String,
  company: String,
  phone: String,
  city: String,
  email: {
    type: String,
    default: "",
  },
  source: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    default: "new",
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium"
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  temperature: {
    type: String,
    enum: ["Cold", "Warm", "Hot"],
    default: "Warm"
  },
  notesList: [{
    text: String,
    date: { type: Date, default: Date.now }
  }],
  followups: [{
    text: String,
    date: { type: Date, default: Date.now },
    method: String
  }],
  upcomingTasks: [{
    text: String,
    due: Date,
    done: { type: Boolean, default: false }
  }],
  activity: [{
    action: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model("Lead", leadSchema);