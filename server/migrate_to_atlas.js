/**
 * 🚀 migrate_to_atlas.js
 * Copies ALL collections from local MongoDB (Compass) → MongoDB Atlas
 *
 * Usage:
 *   node migrate_to_atlas.js "mongodb+srv://user:pass@cluster.mongodb.net/cliento"
 */

const { MongoClient } = require("mongodb");

const LOCAL_URI = "mongodb://127.0.0.1:27017/cliento";
const ATLAS_URI = process.argv[2];

if (!ATLAS_URI) {
  console.error("\n❌ Please provide your Atlas URI as an argument:");
  console.error('   node migrate_to_atlas.js "mongodb+srv://user:pass@cluster.mongodb.net/cliento"\n');
  process.exit(1);
}

async function migrate() {
  const localClient = new MongoClient(LOCAL_URI);
  const atlasClient = new MongoClient(ATLAS_URI);

  try {
    console.log("\n🔌 Connecting to local MongoDB (Compass)...");
    await localClient.connect();
    console.log("✅ Connected to local MongoDB\n");

    console.log("🔌 Connecting to MongoDB Atlas...");
    await atlasClient.connect();
    console.log("✅ Connected to MongoDB Atlas\n");

    const localDb = localClient.db("cliento");
    const atlasDb = atlasClient.db("cliento");

    // Get all collection names from local DB
    const collections = await localDb.listCollections().toArray();

    if (collections.length === 0) {
      console.log("⚠️  No collections found in local 'cliento' database.");
      return;
    }

    console.log(`📦 Found ${collections.length} collection(s) to migrate:\n`);
    collections.forEach(c => console.log(`   - ${c.name}`));
    console.log();

    let totalMigrated = 0;

    for (const col of collections) {
      const colName = col.name;
      const localCollection = localDb.collection(colName);
      const atlasCollection = atlasDb.collection(colName);

      // Fetch all documents from local
      const docs = await localCollection.find({}).toArray();

      if (docs.length === 0) {
        console.log(`⏭️  Skipping '${colName}' — no documents found.`);
        continue;
      }

      // Drop existing data in Atlas for this collection to avoid duplicates
      await atlasCollection.deleteMany({});

      // Insert all documents into Atlas
      const result = await atlasCollection.insertMany(docs);
      console.log(`✅ '${colName}': migrated ${result.insertedCount} document(s)`);
      totalMigrated += result.insertedCount;
    }

    console.log(`\n🎉 Migration complete! Total documents migrated: ${totalMigrated}`);
    console.log("👉 Go to cloud.mongodb.com → Browse Collections to verify your data.\n");

  } catch (err) {
    console.error("\n❌ Migration failed:", err.message);
    if (err.message.includes("ECONNREFUSED")) {
      console.error("   👉 Make sure MongoDB Compass / local MongoDB is running.\n");
    }
    if (err.message.includes("Authentication failed")) {
      console.error("   👉 Check your Atlas username & password in the URI.\n");
    }
  } finally {
    await localClient.close();
    await atlasClient.close();
  }
}

migrate();
