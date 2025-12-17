import mongoose from 'mongoose';

// ⚠️ PASTE YOUR EXACT CONNECTION STRING HERE
const MONGO_URI = "mongodb+srv://abimanyu23ti_db_user:abimanyu23ti@bigdata.qravd4m.mongodb.net/";

const debug = async () => {
  try {
    console.log("🔌 Connecting...");
    await mongoose.connect(MONGO_URI);
    
    // 1. Check the ACTUAL Database Name
    console.log(`\n✅ Connected to database: "${mongoose.connection.name}"`);
    console.log("---------------------------------------------------");

    // 2. List ALL Collections found in this database
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log("📂 Collections found in this DB:");
    if (collections.length === 0) {
        console.log("   (None! The database is empty)");
    } else {
        collections.forEach(c => {
            console.log(`   - Name: [${c.name}] | Type: ${c.type || 'standard'}`);
        });
    }
    
    console.log("---------------------------------------------------");

    // 3. Try to count specifically
    if (collections.find(c => c.name === 'SensorKelompok8')) {
        const count = await mongoose.connection.db.collection('SensorKelompok8').countDocuments();
        console.log(`🔎 Direct Count of 'SensorKelompok8': ${count}`);
    } else {
        console.log("❌ CRITICAL: 'SensorKelompok8' collection does NOT exist in this database.");
        console.log("   -> Check your connection string. You might be in the 'test' database.");
    }

    process.exit();
  } catch (err) {
    console.error("❌ Error:", err);
  }
};

debug();