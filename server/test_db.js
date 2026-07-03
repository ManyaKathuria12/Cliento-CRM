const mongoose = require("mongoose");
const Contact = require("./models/Contact");
const Deal = require("./models/Deal");

async function run() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/cliento");
    console.log("Connected to MongoDB!");

    console.log("1. Counting total contacts...");
    const totalContacts = await Contact.countDocuments();
    console.log("Total Contacts:", totalContacts);

    console.log("2. Fetching distinct companies...");
    const companiesList = await Contact.distinct("company");
    console.log("Companies List:", companiesList);
    const companiesCount = companiesList.filter(Boolean).length;
    console.log("Companies Count:", companiesCount);

    console.log("3. Counting recent contacts...");
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentContacts = await Contact.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    console.log("Recent Contacts:", recentContacts);

    console.log("4. Counting active contacts...");
    const activeCompanies = await Deal.find({ stage: { $nin: ["won", "lost"] } }).distinct("company");
    console.log("Active Companies from Deals:", activeCompanies);
    const activeContacts = await Contact.countDocuments({ company: { $in: activeCompanies } });
    console.log("Active Contacts:", activeContacts);

  } catch (err) {
    console.error("CRASH ERROR:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

run();
