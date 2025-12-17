import pymongo
import numpy as np
import pickle
import time
from tensorflow.keras.models import load_model

# --- 1. CONFIGURATION ---
# ⚠️ Replace with your REAL MongoDB Connection String
MONGO_URI = "mongodb+srv://abimanyu23ti_db_user:abimanyu23ti@bigdata.qravd4m.mongodb.net/"
DB_NAME = "Sensor"
COLLECTION_NAME = "SensorKelompok8"

# AI Settings (MUST match your training notebook)
LOOK_BACK = 30  # Sequence length

# --- 2. CONNECT & LOAD ---
print("🔌 Connecting to MongoDB...")
try:
    client = pymongo.MongoClient(MONGO_URI)
    collection = client[DB_NAME][COLLECTION_NAME]
    print(f"✅ Connected! Found {collection.count_documents({})} documents.")
except Exception as e:
    print(f"❌ DB Error: {e}")
    exit()

print("🧠 Loading AI Models...")
try:
    model = load_model('thi_lstm_model.h5')
    scaler = pickle.load(open('scaler.pkl', 'rb'))
    print("✅ Models loaded!")
except Exception as e:
    print(f"❌ Model Error: {e}")
    print("   (Make sure .h5 and .pkl files are in this folder)")
    exit()

# --- 3. FETCH & PREPARE DATA ---
print("📥 Fetching all data sorted by time...")
# Get all data, sorted Oldest -> Newest
cursor = collection.find().sort("timestamp", 1)
all_docs = list(cursor)

if len(all_docs) <= LOOK_BACK:
    print("❌ Not enough data to run predictions (Need > 30 records)")
    exit()

print(f"📊 Processing {len(all_docs)} records...")

# Extract THI values for the AI
thi_values = []
valid_docs = [] # Keep track of docs that actually have data

for doc in all_docs:
    try:
        temp = float(doc.get('temp', 0))
        hum = float(doc.get('hum', 0))
        
        # ⚠️ USING FORMULA FROM YOUR NOTEBOOK
        # (0.8 * temp) + ((hum * temp) / 500)
        # Note: Your notebook implies 'hum' might be 0-100. 
        # If your notebook formula was raw (hum * temp), we use that.
        thi = (0.8 * temp) + ((hum * temp) / 500)
        
        thi_values.append([thi])
        valid_docs.append(doc)
    except:
        continue

# Convert to Numpy & Scale
# We scale the ENTIRE dataset at once for speed
data_array = np.array(thi_values)
data_scaled = scaler.transform(data_array)

# --- 4. PREDICT & UPDATE ---
print("🚀 Starting Batch Prediction...")
updates_count = 0

# We start loop at LOOK_BACK because we need 30 prior steps to predict step 31
for i in range(LOOK_BACK, len(valid_docs)):
    
    # 1. Prepare Sequence (Past 30 points)
    # If i=30, we take index 0 to 29
    seq_scaled = data_scaled[i-LOOK_BACK:i]
    
    # Reshape for LSTM [1, 30, 1]
    seq_reshaped = seq_scaled.reshape(1, LOOK_BACK, 1)
    
    # 2. Predict the value for Current Index (i)
    # The model was trained to take 30 steps and predict the NEXT one.
    # So using T-30 to T-1 should predict T (current time).
    pred_scaled = model.predict(seq_reshaped, verbose=0)
    pred_unscaled = scaler.inverse_transform(pred_scaled)
    predicted_val = float(pred_unscaled[0][0])
    
    # 3. Update MongoDB
    # We update the document at index 'i' with what the AI *thought* it would be
    doc_id = valid_docs[i]['_id']
    
    collection.update_many(
        {'_id': doc_id},
        {'$set': {'thi_forecast': predicted_val}}
    )
    
    updates_count += 1
    if updates_count % 100 == 0:
        print(f"   Updated {updates_count} records...", end='\r')

print(f"\n✅ COMPLETED! Updated {updates_count} historical records.")
print("   Refesh your dashboard to see the AI Forecast line.")