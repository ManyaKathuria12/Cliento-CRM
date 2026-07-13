const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: String,
  company: String,
  email: String,
  phone: String,
  city: String,
  role: String,
}, { timestamps: true });

// ✅ IMPORTANT
module.exports = mongoose.model("Contact", contactSchema);