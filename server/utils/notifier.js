const Notification = require("../models/Notification");
const User = require("../models/User");

async function notify(app, title, description, category, priority = "medium", createdBy = null) {
  try {
    let creator = createdBy;
    if (!creator) {
      const admin = await User.findOne({ role: "admin" });
      if (admin) creator = admin._id;
    }

    const notification = await Notification.create({
      title,
      description,
      category,
      priority,
      read: false,
      createdBy: creator,
    });

    try {
      const io = app.get("io");
      if (io) {
        io.emit("dashboardUpdated");
      }
    } catch (err) {
      console.log("Socket emit error:", err);
    }

    return notification;
  } catch (err) {
    console.error("Error creating notification:", err);
  }
}

module.exports = { notify };
