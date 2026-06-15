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
  phone: String,
  company: String,
  jobTitle: String,
  location: String,
});
 

module.exports = mongoose.model("User", userSchema);