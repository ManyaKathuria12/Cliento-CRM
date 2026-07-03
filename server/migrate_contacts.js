const mongoose = require("mongoose");
const Contact = require("./models/Contact");

async function run() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/cliento");
    console.log("Connected to MongoDB!");

    const contacts = await Contact.find();
    console.log(`Found ${contacts.length} contacts.`);

    const dates = [
      new Date("2026-04-15T10:00:00Z"), // Contact 1
      new Date("2026-04-20T12:00:00Z"), // Contact 2
      new Date("2026-05-10T14:30:00Z"), // Contact 3
      new Date("2026-05-18T09:15:00Z"), // Contact 4
      new Date("2026-06-05T16:00:00Z"), // Contact 5
    ];

    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      const targetDate = dates[i % dates.length];
      
      // Use Contact.collection to bypass Mongoose timestamp casting
      await Contact.collection.updateOne(
        { _id: contact._id },
        { 
          $set: { 
            createdAt: targetDate,
            updatedAt: targetDate
          } 
        }
      );
      console.log(`Updated contact ${contact.name} with raw createdAt: ${targetDate}`);
    }

    console.log("Migration complete!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
