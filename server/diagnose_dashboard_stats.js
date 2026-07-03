const mongoose = require("mongoose");
const Lead = require("./models/Lead");
const Deal = require("./models/Deal");
const Contact = require("./models/Contact");

async function run() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/cliento");
    console.log("Connected to MongoDB!");

    // Mirror dashboard.js dates logic
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // End date of current month is end of today (or end of month)
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    // End date of previous month is the start of current month (exclusive)
    const endOfPreviousMonth = startOfCurrentMonth;

    console.log("\n--- DATE WINDOWS ---");
    console.log("Current Month Start Date: ", startOfCurrentMonth.toString());
    console.log("Current Month End Date:   ", endOfCurrentMonth.toString());
    console.log("Previous Month Start Date:", startOfPreviousMonth.toString());
    console.log("Previous Month End Date:  ", endOfPreviousMonth.toString());

    // 1. Leads
    const currentLeadsQuery = { createdAt: { $gte: startOfCurrentMonth } };
    const previousLeadsQuery = { createdAt: { $gte: startOfPreviousMonth, $lt: startOfCurrentMonth } };
    
    console.log("\n--- LEADS MONGO QUERIES ---");
    console.log("Current Leads Query: ", JSON.stringify(currentLeadsQuery));
    console.log("Previous Leads Query:", JSON.stringify(previousLeadsQuery));

    const currentLeadsCount = await Lead.countDocuments(currentLeadsQuery);
    const previousLeadsCount = await Lead.countDocuments(previousLeadsQuery);
    const totalLeads = await Lead.countDocuments({});

    console.log("Leads Counts Results:");
    console.log(`- Current Month Leads Count:  ${currentLeadsCount}`);
    console.log(`- Previous Month Leads Count: ${previousLeadsCount}`);
    console.log(`- Total Leads in DB:          ${totalLeads}`);

    // 2. Won Deals & Revenue
    const parseValue = (v) => parseFloat(String(v || 0).replace(/[^0-9.]/g, "")) || 0;
    const deals = await Deal.find();

    const currentWonDeals = deals.filter(d => d.stage === "won" && new Date(d.createdAt) >= startOfCurrentMonth);
    const previousWonDeals = deals.filter(d => d.stage === "won" && new Date(d.createdAt) >= startOfPreviousMonth && new Date(d.createdAt) < startOfCurrentMonth);
    
    const currentRevenue = currentWonDeals.reduce((sum, d) => sum + parseValue(d.value), 0);
    const previousRevenue = previousWonDeals.reduce((sum, d) => sum + parseValue(d.value), 0);

    console.log("\n--- REVENUE DETAILS ---");
    console.log(`- Current Month Won Deals Count:  ${currentWonDeals.length}`);
    console.log(`- Current Month Revenue:          ₹${currentRevenue}`);
    console.log(`- Previous Month Won Deals Count: ${previousWonDeals.length}`);
    console.log(`- Previous Month Revenue:         ₹${previousRevenue}`);

    // 3. Contacts
    const currentContactsQuery = { createdAt: { $gte: startOfCurrentMonth } };
    const previousContactsQuery = { createdAt: { $gte: startOfPreviousMonth, $lt: startOfCurrentMonth } };

    console.log("\n--- CONTACTS MONGO QUERIES ---");
    console.log("Current Contacts Query: ", JSON.stringify(currentContactsQuery));
    console.log("Previous Contacts Query:", JSON.stringify(previousContactsQuery));

    const currentContacts = await Contact.countDocuments(currentContactsQuery);
    const previousContacts = await Contact.countDocuments(previousContactsQuery);
    const totalContacts = await Contact.countDocuments({});

    console.log("Contacts Counts Results:");
    console.log(`- Current Month Contacts Count:  ${currentContacts}`);
    console.log(`- Previous Month Contacts Count: ${previousContacts}`);
    console.log(`- Total Contacts in DB:          ${totalContacts}`);

    // Verify all records month-wise
    console.log("\n--- RECORD DISTRIBUTION BY MONTH ---");
    const allLeads = await Lead.find();
    console.log("All Leads dates check:");
    allLeads.forEach(l => {
      const dt = new Date(l.createdAt);
      console.log(`- Name: ${l.name}, createdAt: ${l.createdAt} -> Month Index: ${dt.getMonth()} (0=Jan, 3=Apr, 4=May, 5=Jun)`);
    });

  } catch (err) {
    console.error("Diagnostic error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
