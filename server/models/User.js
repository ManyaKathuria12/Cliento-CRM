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
});
 

module.exports = mongoose.model("User", userSchema);