from pymongo import MongoClient
from pymongo.database import Database
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "retail_portal")

client: MongoClient = None
db: Database = None


def connect_to_mongo():
    global client, db
    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    print(f"Connected to MongoDB: {DATABASE_NAME}")
    return db


def close_mongo_connection():
    global client
    if client:
        client.close()
        print("MongoDB connection closed")


def get_database() -> Database:
    if db is None:
        connect_to_mongo()
    return db


def get_collection(collection_name: str):
    database = get_database()
    return database[collection_name]
