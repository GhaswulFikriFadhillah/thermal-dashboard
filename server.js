import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- CHANGE 1: UPDATE DATABASE NAME ---
// Change '/test' to '/Sensor' in your URI
// It should look like: ...mongodb.net/Sensor?retryWrites...
const MONGO_URI = "mongodb+srv://abimanyu23ti_db_user:abimanyu23ti@bigdata.qravd4m.mongodb.net/Sensor?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected to 'Sensor' Database!"))
  .catch(err => console.error("❌ DB Connection Error:", err));

// --- CHANGE 2: UPDATE COLLECTION NAME ---
// Inside server.js
const sensorSchema = new mongoose.Schema({
  temp: Number,
  hum: Number,
  thi_forecast: Number, // <--- ADD THIS LINE!
  timestamp: { type: Date, default: Date.now }
}, { 
  collection: 'SensorKelompok8' 
});

// The third argument 'SensorKelompok8' is the most important part!
const SensorData = mongoose.model('SensorData', sensorSchema, 'SensorKelompok8');

// --- API ENDPOINT ---
app.get('/api/readings', async (req, res) => {
  try {
    const readings = await SensorData.find().sort({ timestamp: -1 }).limit(20);
    console.log(`🔎 Found ${readings.length} documents in 'SensorKelompok8'`);
    res.json(readings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));