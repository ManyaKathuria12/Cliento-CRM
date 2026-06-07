const mongoose = require("mongoose"); // 🔥 ADD THIS

const dealSchema = new mongoose.Schema({
  title: String,
  company: String,
  value: String,
  contact: String,
  notes: {
    type: String,
    default: "",
  },
  stage: {
    type: String,
    default: "new",
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lead",
  },
  activity: [
    {
      action: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
}, { timestamps: true }); // 🔥 IMPORTANT

module.exports = mongoose.model("Deal", dealSchema);