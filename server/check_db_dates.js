const mongoose = require("mongoose");
const Lead = require("./models/Lead");
const Deal = require("./models/Deal");
const Contact = require("./models/Contact");

async function run() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/cliento");
    console.log("Connected to MongoDB!");

    console.log("\n--- LEADS ---");
    const leads = await Lead.find();
    console.log(`Total Leads: ${leads.length}`);
    leads.forEach((l, i) => {
      console.log(`Lead ${i+1}: name=${l.name}, createdAt=${l.createdAt}`);
    });

    console.log("\n--- DEALS ---");
    const deals = await Deal.find();
    console.log(`Total Deals: ${deals.length}`);
    deals.forEach((d, i) => {
      console.log(`Deal ${i+1}: name=${d.name}, val=${d.value}, stage=${d.stage}, createdAt=${d.createdAt}`);
    });

    console.log("\n--- CONTACTS ---");
    const contacts = await Contact.find();
    console.log(`Total Contacts: ${contacts.length}`);
    contacts.forEach((c, i) => {
      console.log(`Contact ${i+1}: name=${c.name}, company=${c.company}, createdAt=${c.createdAt}`);
    });

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
