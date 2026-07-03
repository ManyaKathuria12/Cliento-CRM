const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String, // 🔥 ADD THIS
  googleId: String,
  avatar: String,
  role: {
    type: String,
    enum: ["admin", "sales", "manager"],
    default: "sales",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  phone: String,
  company: String,
  jobTitle: String,
  location: String,
  
  // Extended fields for Settings:
  bio: String,
  companyWebsite: String,
  companyIndustry: String,
  companyLogo: String,
  
  // Notification Preferences:
  leadNotifications: { type: Boolean, default: true },
  dealNotifications: { type: Boolean, default: true },
  taskReminders: { type: Boolean, default: true },
  emailNotifications: { type: Boolean, default: true },
  browserNotifications: { type: Boolean, default: true },
  
  // Appearance Preferences:
  theme: { type: String, enum: ["light", "dark"], default: "dark" },
  
  // Session tracking:
  tokenVersion: { type: Number, default: 0 },
});
 

module.exports = mongoose.model("User", userSchema);