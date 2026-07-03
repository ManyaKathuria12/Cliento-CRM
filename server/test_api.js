const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const http = require("http");

const JWT_SECRET = "secret123";

async function run() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/cliento");
    console.log("Connected to MongoDB");

    // Find any user
    const db = mongoose.connection.db;
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({});
    if (!user) {
      console.log("No users found in database!");
      return;
    }

    console.log("Found user:", user.email, "id:", user._id);

    // Sign a token
    const token = jwt.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET);
    console.log("Generated token:", token);

    // Fetch contacts
    await testEndpoint(token, "/api/contacts");
    // Fetch stats
    await testEndpoint(token, "/api/contacts/stats");
    // Fetch leads stats
    await testEndpoint(token, "/api/leads/stats");
    // Fetch tasks stats
    await testEndpoint(token, "/api/tasks/stats");

  } catch (err) {
    console.error("Error in test script:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

function testEndpoint(token, path) {
  return new Promise((resolve) => {
    console.log(`\nTesting GET ${path}...`);
    const req = http.request({
      hostname: "localhost",
      port: 5000,
      path: path,
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }, (res) => {
      console.log(`Status Code: ${res.statusCode}`);
      console.log("Headers:", res.headers);
      
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        console.log("Response Body (first 500 chars):", data.slice(0, 500));
        resolve();
      });
    });

    req.on("error", (e) => {
      console.error(`Request error: ${e.message}`);
      resolve();
    });

    req.end();
  });
}

run();
