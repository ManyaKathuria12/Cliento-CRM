const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: String,
  company: String,
  email: String,
  phone: String,
  city: String,
  role: String,
});

// ✅ IMPORTANT
module.exports = mongoose.model("Contact", contactSchema);