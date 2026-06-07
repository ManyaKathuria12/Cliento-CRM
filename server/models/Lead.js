const mongoose = require("mongoose"); // 🔥 ADD THIS

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
  }
}, { timestamps: true });

module.exports = mongoose.model("Lead", leadSchema);