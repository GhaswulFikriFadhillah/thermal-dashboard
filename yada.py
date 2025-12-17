import pymongo
import time

# --- CONFIGURATION ---
MONGO_URI = "mongodb+srv://abimanyu23ti_db_user:abimanyu23ti@bigdata.qravd4m.mongodb.net/"
DB_NAME = "Sensor"
TARGET_COLLECTION = "SensorKelompok8"
TEMP_COLLECTION = "SensorKelompok8_Temp"

print("🔌 Connecting to MongoDB...")
try:
    client = pymongo.MongoClient(MONGO_URI)
    db = client[DB_NAME]
    print("✅ Connected!")
except Exception as e:
    print(f"❌ Connection Error: {e}")
    exit()

# 1. FETCH DATA
print(f"📦 Reading data from '{TARGET_COLLECTION}'...")
try:
    old_data = list(db[TARGET_COLLECTION].find())
    count = len(old_data)
    print(f"   Found {count} records.")
    
    if count == 0:
        print("⚠️ Collection is empty. Nothing to do.")
        exit()
except Exception as e:
    print(f"❌ Error reading data: {e}")
    exit()

# 2. COPY TO TEMP COLLECTION
print(f"🚀 Copying data to new standard collection '{TEMP_COLLECTION}'...")
try:
    # Clear temp collection if it exists from a failed run
    if TEMP_COLLECTION in db.list_collection_names():
        db[TEMP_COLLECTION].drop()
    
    # Insert all data
    db[TEMP_COLLECTION].insert_many(old_data)
    print(f"✅ Successfully copied {count} records to temp storage.")
except Exception as e:
    print(f"❌ Error copying data: {e}")
    exit()

# 3. DROP OLD COLLECTION
# We must delete the old one because we can't rename it
print(f"🗑️  Deleting the old restricted collection '{TARGET_COLLECTION}'...")
try:
    db[TARGET_COLLECTION].drop()
    print("✅ Old collection dropped.")
except Exception as e:
    print(f"❌ Error dropping old collection: {e}")
    print("   (You may need to delete 'SensorKelompok8' manually in MongoDB Atlas website)")
    exit()

# 4. RENAME TEMP TO ORIGINAL
print(f"wj  Renaming '{TEMP_COLLECTION}' back to '{TARGET_COLLECTION}'...")
try:
    db[TEMP_COLLECTION].rename(TARGET_COLLECTION)
    print("🎉 SUCCESS! Database converted to Standard Collection.")
    print("   You can now run 'python backfill_ai.py'")
except Exception as e:
    print(f"❌ Error renaming: {e}")
    print(f"   Your data is currently safe in '{TEMP_COLLECTION}'.")
    print("   Please rename it manually to 'SensorKelompok8' in MongoDB Atlas.")