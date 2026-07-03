const Notification = require("../models/Notification");

async function notify(app, title, description, category, priority = "medium") {
  try {
    const notification = await Notification.create({
      title,
      description,
      category,
      priority,
      read: false,
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
